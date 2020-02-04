var fs = require('fs')
var parser = require('fast-xml-parser');





const pathReferencesFolder = 'datasets/ontofarm/references/';
const pathToolsFolder = 'datasets/ontofarm/tools/';

const tools = ['ALIN','AML','DOME','Lily','LogMap','LogMapLt','ONTMAT1','SANOM','Wiktionary'];
let totalTest = 0;


var fs = require('fs');
var stream = fs.createWriteStream("tests_dataset.csv");
stream.once('open', function(fd) {
  
    stream.write("Reference,Tool,Precision,Recall,F1\n");

    fs.readdirSync(pathReferencesFolder).forEach(file => {
        // console.log(file);
         
         const pathReference = pathReferencesFolder + file;
     
         for(let i = 0; i < tools.length; i++){
     
             const pathTool = pathToolsFolder + tools[i] + "-" + file.toLowerCase();
            
     
            // console.log("\n\n--------------- Reference Matches --> " + pathReference);
             const refMatches = computeMatches(pathReference);
             if(refMatches==null)return null;
            // console.log("Total: " + refMatches.length);
     
            // console.log("\n\n--------------- Tool Matches --> " + pathTool);
             const toolMatches = computeMatches(pathTool);
             if(toolMatches==null) return null;
            //  console.log("Total: " + toolMatches.length);
     
            // console.log("\n\n--------------- Intersect Matches --> " + pathTool);
             const intersectMatches = intersect(refMatches, toolMatches);
            // console.log("Total: " + intersectMatches.length);
     
            const measure = calculeMeasures(refMatches,toolMatches,intersectMatches);
            
            console.log("\n--- Measures --> " + tools[i] + "-" + file.toLowerCase());
            console.log("Precision: " +  measure.precision );
            console.log("Recall: " + measure.recall);
            console.log("F1: " +  measure.f1);
     
     
            totalTest++;
            stream.write(file.toLowerCase() + "," + tools[i] + "," + measure.precision + "," + measure.recall + ","  + measure.f1 + "\n");
     
     
         }
     
     });

    stream.end();
});




console.log("\n\nTotal Test: " + totalTest)
/*
    ---------------- Functions ----------------
*/


function calculeMeasures(refMatches, toolMatches, intersect){
    const precision =  intersect.length / toolMatches.length;
    const recall = intersect.length / refMatches.length;
    const f1 = 2 * ( (precision * recall) / (precision + recall) )
    return {
        precision: precision, 
        recall:recall, 
        f1:f1
    } 
}

function intersect(refMatches, toolMatches){
    const matches = [];                                                 
    for(let i = 0; i < refMatches.length; i++){
        for(let j = 0; j < toolMatches.length; j++){
            if( refMatches[i].entity1 === toolMatches[j].entity1 && 
                refMatches[i].entity2 === toolMatches[j].entity2){
                    //printMatch(refMatches[i]);
                    matches.push(refMatches[i]);
            }
        }    
    }    
    
    return matches;

}

function computeMatches(path){
    const matchesRDF = RDFtoJson(path)['rdf:RDF']['Alignment']["map"];
    if(matchesRDF == null)return null;
    const matches = [];
    for(let i = 0; i < matchesRDF.length; i++){
        //console.log(matchesRDF[i]);
        let match = {
            entity1: matchesRDF[i]["Cell"]['entity1']["@_rdf:resource"],
            entity2: matchesRDF[i]["Cell"]['entity2']["@_rdf:resource"],
            measure: matchesRDF[i]["Cell"]['measure']['#text']
        }
        matches.push(match);
        //printMatch(match);
    }
    return matches;
}

function RDFtoJson(path){
    
    if(!fs.existsSync(path)) {
        console.log("=========== File not found ===========");
        process.exit(5);
        return null;
    }

    var data = fs.readFileSync(path, 'utf8');
   
    if( parser.validate(data) === true) { 
        
        var options = {
          
            ignoreAttributes : false
          
        };    
        
        var jsonObj = parser.parse(data,options);
        return jsonObj;
    }else{
        console.log("=========== Parse Error! ===========");
    }
    return null;
}

function printMatch(match){
    console.log("............................................");
    console.log();
    console.log(match.entity1 + " - vs - " + match.entity2 + " ==> " + match.measure);
}
