"""
JanDrishti — Resilient Government Endpoint Connector
Ethical, rate-limited, cached HTTP connector with exponential backoff for official public endpoints.
Strictly adheres to respectful civic transparency standards. Never bypasses authentication or CAPTCHAs.
"""

import time
import logging
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger("jandrishti.connector")


class ResilientConnector:
    """
    Respectful HTTP client for querying official government portals.
    Features:
      - In-memory response caching with TTL
      - Enforced rate limiting (max 1 req/sec) to avoid overloading government servers
      - Exponential backoff retry logic (1s, 2s, 4s)
      - Strict timeout protection
    """

    def __init__(
        self,
        min_interval_seconds: float = 1.0,
        default_timeout_seconds: float = 15.0,
        cache_ttl_seconds: float = 3600.0,
    ):
        self.min_interval = min_interval_seconds
        self.timeout = default_timeout_seconds
        self.cache_ttl = cache_ttl_seconds
        self.last_request_time: float = 0.0
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.default_headers = {
            "User-Agent": (
                "JanDrishti-Civic-Intelligence/1.0 "
                "(Academic & Public Governance Transparency; "
                "+https://github.com/siddhesh-b22/jandrishti)"
            ),
            "Accept": "application/json, text/plain, */*",
        }

    def _rate_limit(self):
        """Ensure minimum delay between consecutive requests to external servers."""
        now = time.time()
        elapsed = now - self.last_request_time
        if elapsed < self.min_interval:
            sleep_time = self.min_interval - elapsed
            time.sleep(sleep_time)
        self.last_request_time = time.time()

    def fetch_json(
        self,
        url: str,
        method: str = "GET",
        headers: Optional[Dict[str, str]] = None,
        json_payload: Optional[Dict[str, Any]] = None,
        max_retries: int = 3,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        Fetch JSON from a legitimate official public endpoint with caching and retry logic.
        """
        cache_key = f"{method}:{url}:{str(json_payload)}"

        # Check Cache
        if use_cache and cache_key in self._cache:
            entry = self._cache[cache_key]
            if time.time() - entry["timestamp"] < self.cache_ttl:
                logger.debug(f"[CACHE_HIT] {url}")
                return entry["data"]

        req_headers = dict(self.default_headers)
        if headers:
            req_headers.update(headers)

        last_exception = None
        for attempt in range(1, max_retries + 1):
            self._rate_limit()
            try:
                with httpx.Client(timeout=self.timeout, follow_redirects=True) as client:
                    if method.upper() == "POST":
                        res = client.post(url, headers=req_headers, json=json_payload)
                    else:
                        res = client.get(url, headers=req_headers)

                    if res.status_code == 200:
                        try:
                            data = res.json()
                            if use_cache:
                                self._cache[cache_key] = {
                                    "data": data,
                                    "timestamp": time.time(),
                                }
                            return data
                        except Exception as e:
                            logger.error(f"Failed to parse JSON from {url}: {e}")
                            raise ValueError(f"Invalid JSON response from {url}")

                    elif res.status_code in (429, 500, 502, 503, 504):
                        backoff = 2 ** (attempt - 1)
                        logger.warning(
                            f"Transient HTTP {res.status_code} from {url}. "
                            f"Retrying in {backoff}s (attempt {attempt}/{max_retries})..."
                        )
                        time.sleep(backoff)
                    else:
                        res.raise_for_status()

            except (httpx.ConnectError, httpx.TimeoutException) as e:
                last_exception = e
                backoff = 2 ** (attempt - 1)
                logger.warning(
                    f"Network error on {url}: {e}. Retrying in {backoff}s..."
                )
                time.sleep(backoff)
            except Exception as e:
                logger.error(f"Unhandled error fetching {url}: {e}")
                raise e

        raise RuntimeError(
            f"Failed to fetch {url} after {max_retries} attempts: {last_exception}"
        )


# Global singleton connector instance
government_connector = ResilientConnector()
