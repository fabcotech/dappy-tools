const { lookup } = require('./index');

const { createNodeLookup } = require('./index');

function test_lookup() {
    lookup("foo").then((result) => {
        console.log(result);
    });    
}

function test_createNodeLookup() {
    const http = require('http');
    const { lookup } = createNodeLookup();

    http.get('http://your-dappy-name/', {
        lookup,
    }, (res) => {
        res.setEncoding('utf8');
        res.on('data', (data) => {
            console.log("ok");
        })
    });
}
test_lookup();
test_createNodeLookup()
