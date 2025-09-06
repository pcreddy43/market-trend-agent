"""
BaseAgent: Provides logging, error handling, and DB connection for all agents.
"""
import logging
import os
import sqlalchemy
from dotenv import load_dotenv

load_dotenv()

class BaseAgent:
    def __init__(self, db_url_env="TIMESCALEDB_URL"):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.logger.setLevel(logging.INFO)
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('[%(asctime)s] %(levelname)s %(name)s: %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
        self.db_url = os.getenv(db_url_env, "postgresql://postgres:postgres@localhost:5432/market")
        self.engine = sqlalchemy.create_engine(self.db_url)

    def log(self, msg, level=logging.INFO):
        self.logger.log(level, msg)

    def handle_error(self, err):
        self.logger.error(f"Error: {err}")
