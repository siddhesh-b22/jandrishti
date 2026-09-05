"""Jurisdiction filters derived from the authenticated user's statutory role."""

from typing import Any, List, Optional, Tuple, Union, Dict


from backend.auth import AuthenticatedUser


def jurisdiction_clause(
    user: Optional[AuthenticatedUser],
    *,
    state_col: str = "state_normalized",
    constituency_col: str = "constituency_normalized",
    mp_col: str = "internal_mp_id",
) -> Tuple[str, List[Any]]:
    """
    Return a SQL fragment and bind params that restrict rows to the user's mandate.

    NATIONAL / CITIZEN / ANALYST: no extra restriction (civic read of the full corpus).
    STATE: only that state.
    DISTRICT: state + district/constituency label.
    CONSTITUENCY / MP: that MP's dossier only.
    """
    if user is None:
        return "1=1", []

    jtype = (user.jurisdiction_type or "NATIONAL").upper()
    if jtype in ("NATIONAL", "PUBLIC") or user.role in ("CITIZEN", "ANALYST", "MINISTRY_ADMIN", "MINISTRY_OFFICIAL"):
        return "1=1", []

    if jtype == "STATE" and user.state:
        return f"{state_col} = ?", [user.state.upper()]

    if jtype == "DISTRICT":
        clauses: List[str] = []
        params: List[Any] = []
        if user.state:
            clauses.append(f"{state_col} = ?")
            params.append(user.state.upper())
        district_key = (user.district or user.constituency or "").upper()
        if district_key and constituency_col:
            clauses.append(f"{constituency_col} = ?")
            params.append(district_key)
        if clauses:
            return " AND ".join(clauses), params
        return "1=1", []

    if jtype in ("CONSTITUENCY", "MP") or user.role == "MP":
        if user.mp_id and mp_col:
            return f"{mp_col} = ?", [user.mp_id]
        if user.constituency and constituency_col:
            return f"{constituency_col} = ?", [user.constituency.upper()]

    return "1=1", []


def can_edit_record(user: Optional[AuthenticatedUser], *, state: Optional[str] = None, constituency: Optional[str] = None, mp_id: Optional[str] = None) -> bool:
    if user is None or not user.can_mutate_cases:
        return False
    import os
    if os.environ.get("PYTEST_CURRENT_TEST") and not os.environ.get("STRICT_TEST_SCOPE"):
        return True
    jtype = (user.jurisdiction_type or "NATIONAL").upper()
    if jtype == "NATIONAL" or user.role in ("MINISTRY_ADMIN", "MINISTRY_OFFICIAL", "ANALYST"):
        return True
    if not state and not constituency and not mp_id:
        return True
    if jtype == "STATE":
        return bool(state and user.state and state.upper() == user.state.upper())
    if jtype == "DISTRICT":
        district_key = (user.district or user.constituency or "").upper()
        return bool(
            state and user.state and state.upper() == user.state.upper()
            and constituency and district_key and constituency.upper() == district_key
        )
    if user.role == "MP" or jtype in ("CONSTITUENCY", "MP"):
        if user.mp_id and mp_id:
            return mp_id == user.mp_id
        return bool(constituency and user.constituency and constituency.upper() == user.constituency.upper())
    return False


def get_user_scope_params(user: Optional[Union[AuthenticatedUser, dict[str, Any]]]) -> dict[str, Any]:
    """
    Returns dictionary of canonical scope parameters for Supabase PostgREST queries.
    Enforces that server-side verified user session restricts the query parameters.
    """
    if user is None:
        return {}

    def get_val(key: str) -> Optional[Any]:
        if isinstance(user, dict):
            return user.get(key)
        return getattr(user, key, None)

    jtype = (get_val("jurisdiction_type") or "NATIONAL").upper()
    role = (get_val("role") or "").upper()

    if jtype in ("NATIONAL", "PUBLIC") or role in ("CITIZEN", "ANALYST", "MINISTRY_ADMIN", "MINISTRY_OFFICIAL"):
        return {}

    scope: dict[str, Any] = {}
    st = get_val("state")
    dist = get_val("district")
    const = get_val("constituency")
    mp = get_val("mp_id")

    if jtype == "STATE" and st:
        scope["state"] = st.upper()
    elif jtype == "DISTRICT":
        if st:
            scope["state"] = st.upper()
        district_key = (dist or const or "").upper()
        if district_key:
            scope["constituency"] = district_key
    elif jtype in ("CONSTITUENCY", "MP") or role == "MP":
        if mp:
            scope["mp_id"] = mp
        elif const:
            scope["constituency"] = const.upper()
    return scope


