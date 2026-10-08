"""Centralized logging utility for your project.

Import `get_logger` from this module to obtain a fully configured logger:

    from logger import get_logger
    logger = get_logger(__name__)
    logger.info("Hello, world!")

Configuration is driven by environment variables so you can change the
behavior without touching code:

* **LOG_LEVEL** – root log level (default: INFO)
* **LOG_DIR**   – directory where log files are stored (default: ./logs)

The first import of this module sets up:
* A **stream handler** to stdout with nicely formatted timestamps.
* A **rotating file handler** (<5 MB, 3 backups) at ``$LOG_DIR/app.log``.

Subsequent imports detect that logging is already configured and simply
return child loggers.
"""
from __future__ import annotations

import logging
import logging.handlers
import os
from pathlib import Path
from typing import Optional

__all__ = ["get_logger", "set_level"]
print(os.getenv("LOG_DIR"))
LOG_DIR = Path(os.getenv("LOG_DIR", "logs"))
LOG_FILE = LOG_DIR / "app.log"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

LOG_DIR.mkdir(parents=True, exist_ok=True)

def _color_formatter() -> logging.Formatter:
    """Return a color‑aware formatter if *colorlog* is available, else plain."""
    try:
        from colorlog import ColoredFormatter  # type: ignore

        return ColoredFormatter(
            fmt="%(log_color)s%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
            log_colors={
                "DEBUG": "cyan",
                "INFO": "green",
                "WARNING": "yellow",
                "ERROR": "red",
                "CRITICAL": "bold_red",
            },
        )
    except ModuleNotFoundError:
        return logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )


def _configure_root_logger(level: str = LOG_LEVEL, log_file: Path = LOG_FILE) -> None:
    """Attach handlers to the *root* logger exactly once."""
    root = logging.getLogger()
    if root.handlers:  # already configured
        return

    root.setLevel(level)

    # Console (stream) handler
    sh = logging.StreamHandler()
    sh.setLevel(level)
    sh.setFormatter(_color_formatter())
    root.addHandler(sh)

    # Rotating file handler
    fh = logging.handlers.RotatingFileHandler(
        log_file,
        maxBytes=5 * 1024 * 1024,  # 5 MB
        backupCount=3,
        encoding="utf‑8",
    )
    fh.setLevel("DEBUG")  # persist everything to file
    fh.setFormatter(
        logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(filename)s:%(lineno)d | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )
    root.addHandler(fh)


_configure_root_logger()

def get_logger(name: str | None = None) -> logging.Logger:  # noqa: D401
    """Return a child logger derived from the root configuration.

    * If *name* is ``None`` (the default), you get the **root logger**.
    * Pass ``__name__`` from your module for granular namespacing.
    """
    return logging.getLogger(name)


def set_level(level: str | int) -> None:
    """Dynamically change the root log level at runtime.

    Example:
        >>> from logger import set_level, get_logger
        >>> set_level("DEBUG")
        >>> get_logger(__name__).debug("Verbose mode enabled")
    """
    logging.getLogger().setLevel(level)
