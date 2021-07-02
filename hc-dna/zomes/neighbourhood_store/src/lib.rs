use chrono::{DateTime, Utc};
use hdk::prelude::*;

mod utils;

use utils::err;

//TODO
// DNA needs spam protection since it is supposed to be public
// Validation on the linking of some shared perspective to some key to be sure that only the original key creator can create a link

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct ExpressionProof {
    pub signature: String,
    pub key: String,
    pub valid: Option<bool>,
    pub invalid: Option<bool>,
}

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct Perspective {
    pub links: Vec<LinkExpression>
}

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct LinkExpression {
    author: String,
    timestamp: DateTime<Utc>,    
    data: Link,
    proof: ExpressionProof,
}

#[derive(Serialize, Deserialize, Clone, SerializedBytes, Debug)]
pub struct Link {
    pub source: String,
    pub target: String,
    pub predicate: Option<String>
}

#[hdk_entry(id = "neighbourhood_expression", visbility = "public")]
#[derive(Clone)]
pub struct NeighbourhoodExpression {
    pub author: String,
    pub timestamp: DateTime<Utc>,
    pub data: NeighbourhoodData,
    pub proof: ExpressionProof,
}

#[derive(Clone, SerializedBytes, Serialize, Deserialize, Debug)]
pub struct NeighbourhoodData {
    #[serde(rename(serialize = "linkLanguage"))]
    #[serde(rename(deserialize = "linkLanguage"))]
    link_language: String,
    meta: Perspective
}


#[hdk_entry(id = "key", visbility = "public")]
#[derive(Clone)]
pub struct Key(String);

#[hdk_extern]
fn entry_defs(_: ()) -> ExternResult<EntryDefsCallbackResult> {
    Ok(vec![NeighbourhoodExpression::entry_def(), Key::entry_def()].into())
}


// Zome functions

/// Run function where zome is init'd by agent
#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
pub fn index_neighbourhood(data: NeighbourhoodExpression) -> ExternResult<EntryHash> {
    let neighbourhood_expression_hash = hash_entry(&data)?;
    create_entry(&data)?;

    Ok(neighbourhood_expression_hash)
}

#[hdk_extern]
pub fn get_neighbourhood(key: EntryHash) -> ExternResult<Option<NeighbourhoodExpression>> {
    match get(key, GetOptions::default())
        .map_err(|error| err(format!("{}", error).as_ref()))? {
            Some(elem) => {
                let exp_data: NeighbourhoodExpression = elem
                    .entry()
                    .to_app_option()?
                    .ok_or(WasmError::Host(String::from(
                        "Could not deserialize link expression data into Profile type",
                    )))?;
                Ok(Some(exp_data))
            },
            None => Ok(None)
        }
}
