var fs = require('fs')
var parser = require('fast-xml-parser');



const pathReference = 'datasets/ontofarm/references/cmt-conference.rdf';
const pathTool = 'datasets/ontofarm/tools/ALIN-cmt-conference.rdf';


console.log("\n\n--------------- Reference Matches --> " + pathReference);
const refMatches = computeMatches(pathReference);
console.log("Total: " + refMatches.length);

console.log("\n\n--------------- Tool Matches --> " + pathTool);
const toolMatches = computeMatches(pathTool);
console.log("Total: " + toolMatches.length);

console.log("\n\n--------------- Intersect Matches --> " + pathTool);
const intersectMatches = intersect(refMatches,toolMatches);
console.log("Total: " + intersectMatches.length);

console.log("\n\n--------------- Measures --> " + pathTool);
calculeMeasures(refMatches,toolMatches,intersectMatches);


/*
    ---------------- Functions ----------------
*/


function calculeMeasures(refMatches, toolMatches, intersect){
    const precision =  intersect.length / toolMatches.length;
    const recall = intersect.length / refMatches.length;
    const f1 = 2 * ( (precision * recall) / (precision + recall) )
    console.log("Precision: " +  precision );
    console.log("Recal: " + recall);
    console.log("F1: " +  f1);
}

function intersect(refMatches, toolMatches){
    const matches = [];
    for(let i = 0; i < refMatches.length; i++){
        for(let j = 0; j < toolMatches.length; j++){
            if( refMatches[i].entity1 === toolMatches[j].entity1 && 
                refMatches[i].entity2 === toolMatches[j].entity2){
                    printMatch(refMatches[i]);
                    matches.push(refMatches[i]);
            }
        }    
    }    
    
    return matches;

}

function computeMatches(path){
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
