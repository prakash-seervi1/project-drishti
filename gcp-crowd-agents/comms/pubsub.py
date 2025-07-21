from google.cloud import pubsub_v1
from config import GCP_PROJECT, PUBSUB_TOPIC_PREFIX
import json

class PubSubComms:
    def __init__(self, agent_name):
        self.publisher = pubsub_v1.PublisherClient()
        self.subscriber = pubsub_v1.SubscriberClient()
        self.topic_path = self.publisher.topic_path(GCP_PROJECT, f"{PUBSUB_TOPIC_PREFIX}{agent_name}")
        self.subscription_path = self.subscriber.subscription_path(GCP_PROJECT, f"{PUBSUB_TOPIC_PREFIX}{agent_name}_sub")

    def publish(self, message: dict):
        data = json.dumps(message).encode("utf-8")
        future = self.publisher.publish(self.topic_path, data)
        return future.result()

    def subscribe(self, callback):
        import logging
        def _callback(message):
            logging.info(f"[PubSubComms] Message received: {message.data}")
            try:
                data = json.loads(message.data.decode("utf-8"))
                logging.info(f"[PubSubComms] Decoded data: {data}")
                callback(data)
                logging.info("[PubSubComms] Callback executed successfully.")
            except Exception as e:
                logging.error(f"[PubSubComms] Error in callback: {e}")
            message.ack()
            logging.info("[PubSubComms] Message acked.")
        logging.info(f"[PubSubComms] Subscribing to {self.subscription_path}")
        self.subscriber.subscribe(self.subscription_path, callback=_callback) 