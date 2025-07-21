const functions = require('firebase-functions');
const { db, admin } = require('./index.js').dependencies;
const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery();
const datasetId = 'drishti_analytics'; // Change to your dataset
const tableId = 'crowd_history';       // Change to your table

async function ensureDatasetAndTable() {
  // Ensure dataset exists
  const [datasets] = await bigquery.getDatasets();
  const datasetExists = datasets.some(ds => ds.id === datasetId);
  if (!datasetExists) {
    await bigquery.createDataset(datasetId);
    console.log(`Created dataset: ${datasetId}`);
  }
  // Ensure table exists
  const dataset = bigquery.dataset(datasetId);
  const [tables] = await dataset.getTables();
  const tableExists = tables.some(tbl => tbl.id === tableId);
  if (!tableExists) {
    const schema = [
      { name: 'zoneId', type: 'STRING' },
      { name: 'timestamp', type: 'TIMESTAMP' },
      { name: 'peopleCount', type: 'INTEGER' },
      { name: 'crowdDensity', type: 'STRING' },
      { name: 'source', type: 'STRING' },
      { name: 'imageUrl', type: 'STRING' }
    ];
    await dataset.createTable(tableId, { schema });
    console.log(`Created table: ${tableId}`);
  }
}

async function generateSyntheticCrowdHistory(minRows = 1000) {
  // Count current rows
  const [rows] = await bigquery.query({
    query: `SELECT COUNT(*) as count FROM drishti_analytics.crowd_history`,
  });
  const currentCount = rows[0].count;
  if (currentCount >= minRows) return 0;
  const toAdd = minRows - currentCount;
  // Get all unique zoneIds
  const [zoneRows] = await bigquery.query({
    query: `SELECT DISTINCT zoneId FROM drishti_analytics.crowd_history`,
  });
  const zoneIds = zoneRows.map(r => r.zoneId).filter(Boolean);
  if (zoneIds.length === 0) zoneIds.push('zone-1');
  // Generate insert statements
  const now = Date.now();
  let inserts = [];
  for (let i = 0; i < toAdd; i++) {
    const zoneId = zoneIds[i % zoneIds.length];
    const timestamp = new Date(now - (toAdd - i) * 60000).toISOString();
    const peopleCount = 50 + Math.floor(Math.random() * 400);
    const crowdDensity = peopleCount > 350 ? 'high' : peopleCount > 200 ? 'moderate' : 'low';
    const source = 'Synthetic';
    const imageUrl = '';
    inserts.push(`('${zoneId}', TIMESTAMP('${timestamp}'), ${peopleCount}, '${crowdDensity}', '${source}', '${imageUrl}')`);
  }
  const insertQuery = `INSERT INTO drishti_analytics.crowd_history (zoneId, timestamp, peopleCount, crowdDensity, source, imageUrl) VALUES ${inserts.join(',')}`;
  await bigquery.query({ query: insertQuery });
  return toAdd;
}

const corsHandler = (req, res, callback) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  callback();
};

module.exports = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      await ensureDatasetAndTable();
      // Optionally generate synthetic data
      const isGenerateData = req.query.isGenerateData === 'true';
      let generated = 0;
      if (isGenerateData) {
        generated = await generateSyntheticCrowdHistory(1000);
        console.log(`Generated ${generated} synthetic rows in BigQuery.`);
      }
      const zonesSnap = await db.collection('zones').get();
      let rows = [];
      for (const zoneDoc of zonesSnap.docs) {
        const zoneId = zoneDoc.id;
        const crowdHistorySnap = await db.collection('zones').doc(zoneId).collection('crowdHistory').get();
        for (const entry of crowdHistorySnap.docs) {
          const data = entry.data();
          rows.push({
            zoneId,
            timestamp: data.timestamp ? data.timestamp.toDate() : null,
            peopleCount: data.peopleCount,
            crowdDensity: data.crowdDensity,
            source: data.source || '',
            imageUrl: data.imageUrl || '',
          });
          if (rows.length >= 500) {
            await bigquery.dataset(datasetId).table(tableId).insert(rows);
            console.log(`Inserted 500 rows for zone ${zoneId}`);
            rows = [];
          }
        }
      }
      if (rows.length > 0) {
        await bigquery.dataset(datasetId).table(tableId).insert(rows);
        console.log(`Inserted final ${rows.length} rows`);
      }
      res.status(200).send(`Export to BigQuery complete! Synthetic rows generated: ${generated}`);
    } catch (error) {
      console.error('Export failed:', error);
      res.status(500).send('Export failed: ' + error.message);
    }
  });
}); 