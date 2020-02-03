var fs = require('fs')
var parser = require('fast-xml-parser');



const pathReference = 'datasets/ontofarm/references/cmt-conference.rdf';
const pathTool = 'datasets/ontofarm/tools/ALIN-cmt-conference.rdf';

//const refMatches = computeReference(pathReference);
const toolMatches = computeTool(pathTool);






/*
    ---------------- Functions ----------------
*/

function computeTool(path){

    console.log(RDFtoJson(path));
}

function computeReference(path){
    console.log();
    console.log("--------------- Reference Matches ---------------");
    const matchesRDF = RDFtoJson(path)['rdf:RDF']['Alignment']["map"];
    const matches = [];
    for(let i = 0; i < matchesRDF.length; i++){
        //console.log(matchesRDF[i]);
        let match = {
            entity1: matchesRDF[i]["Cell"]['entity1']["@_rdf:resource"],
            entity2: matchesRDF[i]["Cell"]['entity2']["@_rdf:resource"],
            measure: matchesRDF[i]["Cell"]['measure']['#text']
        }
        matches.push(match);
        printMatch(match);
    }
    return matches;
}

function RDFtoJson(path){
    var data = fs.readFileSync(path, 'utf8');
    if( parser.validate(data) === true) { 
        
        var options = {
          
            ignoreAttributes : false
          
        };    
        
        var jsonObj = parser.parse(data,options);
        return jsonObj;
    }else{
        console.log("Parse Error!");
    }
    return null;
}

function printMatch(match){
    console.log("............................................");
    console.log();
    console.log(match.entity1 + " - vs - " + match.entity2 + " ==> " + match.measure);
}
