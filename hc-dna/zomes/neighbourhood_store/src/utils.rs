use hdk::prelude::*;

pub fn err(reason: &str) -> WasmError {
    WasmError::Host(String::from(reason))
}

pub (crate) fn get_latest_link(base: EntryHash, tag: Option<LinkTag>) -> ExternResult<Option<Link>> {
    let profile_info = get_links(base.into(), tag)?.into_inner();

    // Find the latest
    let latest_info =
        profile_info
            .into_iter()
            .fold(None, |latest: Option<Link>, link| match latest {
                Some(latest) => {
                    if link.timestamp > latest.timestamp {
                        Some(link)
                    } else {
                        Some(latest)
                    }
                }
                None => Some(link),
            });
    return Ok(latest_info);
}
