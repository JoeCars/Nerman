async function dodo() {
    return 1;
}

module.exports.dodo = async function() {
    return dodo();
}



// Get Noun image by ID
// Method	Path	Description
// GET	/{id}	Fetch a PNG of the given Noun ID
// GET	/{id}.svg	Fetch an SVG of the given Noun ID (try also with .jpg, and .webp)
// Get a tile of the Nouns owned by an Address or ENS Name
// Method	Path	Description
// GET	/yourname.ens	Get a tile of all Nouns owned by the provided ENS name
// GET	/{ETH Address}	Get a tile of all Nouns owned by the provided address
// You can also use the following query parameters with tile endpoints:

// Name	Default	Description
// includeDelegates	false	When building a tile of an address’ Nouns, include Nouns delegated to the address
// Examples
// https://noun.pics/0
// https://noun.pics/110.jpg
// https://noun.pics/90.svg
// https://noun.pics/0x2573C60a6D127755aA2DC85e342F7da2378a0Cc5
// https://noun.pics/subbo.eth
// https://noun.pics/hot.4156.eth?includeDelegates=true