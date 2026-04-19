import pytest

from main import reset_vendors


@pytest.fixture(autouse=True)
def _clear_vendors():
    reset_vendors()
    yield
    reset_vendors()
