var fs = require('fs')
var parser = require('fast-xml-parser');


const pathReferencesFolder = 'datasets/ontofarm/references/';
const pathToolsFolder = 'datasets/ontofarm/tools/';

const tools = ['ALIN','AML','DOME','Lily','LogMap','LogMapLt','ONTMAT1','SANOM','Wiktionary'];
let totalTest = 0;


var fs = require('fs');
var stream = fs.createWriteStream("tests_dataset.csv");
const map_tools = {};

//const toolMatches = computeMatches( pathToolsFolder + 'ALIN' + "-edas-sigkdd.rdf");
//console.log(toolMatches.length)


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
     
            const measure = calculeMeasures2(refMatches,toolMatches,intersectMatches);
            
            console.log("\n--- Measures --> " + tools[i] + "-" + file.toLowerCase());
            console.log("Precision: " +  measure.precision );
            console.log("Recall: " + measure.recall);
            console.log("F1: " +  measure.f1);
            
            console.log("refe " + refMatches.length)
            console.log("tool " + toolMatches.length)
            console.log("inter " + intersect.length)

            console.log("true_positives " + measure.true_positives)
            console.log("false_positives " + measure.false_positives)
            console.log("false_negatives " + measure.false_negatives)

            
     
            totalTest++;
            stream.write(file.toLowerCase() + "," + tools[i] + "," + measure.precision + "," + measure.recall + ","  + measure.f1 + "\n");
            
            if( map_tools[ tools[i] ]  == null){
                map_tools[ tools[i] ] = {
                    tool:tools[i],
                    precision_sum: measure.precision,
                    recall_sum: measure.recall,
                    f1_sum: measure.f1,
                    count:1
                };
            }else{
                map_tools[ tools[i] ].precision_sum += measure.precision;
                map_tools[ tools[i] ].recall_sum+= measure.recall;
                map_tools[ tools[i] ].f1_sum += measure.f1;
                map_tools[ tools[i] ].count++;
            }
         }
     
     });

    stream.end();
    console.log("\n\nTotal Test: " + totalTest)


    /*
    ---------------- AVG ----------------
    */
   console.log("\n\n---------------- AVG ---------------- ")
    for(let i = 0; i < tools.length; i++){
        console.log("________________________________________")
        console.log(tools[i] + " count:" + map_tools[ tools[i] ].count )
        console.log("precision(avg): " +  roundToTwo(map_tools[ tools[i] ].precision_sum / map_tools[ tools[i] ].count))
        console.log("recall(avg): " +  roundToTwo(map_tools[ tools[i] ].recall_sum / map_tools[ tools[i] ].count))
        console.log("f1(avg): " +  roundToTwo(map_tools[ tools[i] ].f1_sum / map_tools[ tools[i] ].count))
       
    }
});


/*
    ---------------- Functions ----------------
*/


function calculeMeasures(refMatches, toolMatches, intersect){

    if(intersect.length == 0 || toolMatches.length == 0 || refMatches.length == 0 ){
        return { precision:0, recall:0, f1:0, 
            true_positives:  intersect.length,
            false_positives: toolMatches.length - intersect.length,
            false_negatives: refMatches.length - intersect.length }
    }
    const precision =  intersect.length / toolMatches.length;
    const recall = intersect.length / refMatches.length;
    const f1 = 2 * ( (precision * recall) / (precision + recall) )
    
    return {
        precision: roundToTwo(precision), 
        recall:roundToTwo(recall), 
        f1:roundToTwo(f1),
        true_positives:  intersect.length,
        false_positives: toolMatches.length - intersect.length,
        false_negatives: refMatches.length - intersect.length
    } 
}


function calculeMeasures2(refMatches, toolMatches, intersect){

    if(intersect.length == 0 || toolMatches.length == 0 || refMatches.length == 0 ){
        return { precision:0, recall:0, f1:0, 
            true_positives:  intersect.length,
            false_positives: toolMatches.length - intersect.length,
            false_negatives: refMatches.length - intersect.length }
    }

    const true_positives =  intersect.length;
    const false_positives = toolMatches.length - intersect.length;
    const false_negatives = refMatches.length - intersect.length;

    const precision = roundToTwo(Math.min(Math.round(true_positives * 1000 / (true_positives + false_positives)) / 1000, 1))
    const recall = roundToTwo(Math.min(Math.round(true_positives * 1000 / (true_positives + false_negatives)) / 1000, 1))
	const f1 = roundToTwo(Math.round((2000 * precision * recall) / (precision + recall)) / 1000)
    
    return {
        precision: precision, 
        recall: recall, 
        f1: f1,
        true_positives:  true_positives,
        false_positives: false_positives,
        false_negatives: false_negatives
    } 
}


function intersect(refMatches, toolMatches){
    const matches = [];                                                 
    for(let i = 0; i < refMatches.length; i++){
        for(let j = 0; j < toolMatches.length; j++){
            if( refMatches[i].entity1.toLowerCase() === toolMatches[j].entity1.toLowerCase() && 
                refMatches[i].entity2.toLowerCase() === toolMatches[j].entity2.toLowerCase()){
                    //printMatch(refMatches[i]);
                    //if(toolMatches[j].measure >= 1){
                        matches.push(refMatches[i]);
                    //}
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
        if(match.measure != 1 ) {
           // console.log("Match Measure != 1 -> " + match.measure + " path: " + path);
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

function roundToTwo(num) {    
    return +num;
    //return +num.toFixed(2)
    //return +(Math.round(num + "e+2")  + "e-2");
}
