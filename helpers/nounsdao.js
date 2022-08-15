const { request, gql } = require('graphql-request');


/**
 * Gets the two most recent Auction items from Nouns Subgraph
 * https://thegraph.com/hosted-service/subgraph/nounsdao/nouns-subgraph
 * @return {data} the data response
 */

async function getLatestAuctions(){

    const endpoint = 'https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph'

    const query = gql`
    {
        auctions(orderBy: startTime, orderDirection: desc, first: 2) {
        id
        endTime
        startTime
        settled
        }
    }
    `

    return await request(endpoint, query);

}

async function getLatestProposals(n, order){

    const endpoint = 'https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph'

    const query = gql`
    {
        proposals(first:`+n+`, orderBy: startBlock, orderDirection: `+ order+`) {
          id
          description
          status
        }
    }
    `

    return await request(endpoint, query);

}
  

module.exports.getLatestAuctions = async function() {
    return getLatestAuctions();
}

module.exports.getLatestProposals = async function(n, order) {
    return getLatestProposals(n, order);
}