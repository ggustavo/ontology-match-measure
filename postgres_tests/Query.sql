/* SELECT "Track ", "TestCase", "Matcher",
       "Type Left", "URI Left", 
       "Relation", 
       "Confidence", 
       "URI Right", 
       "Type Right", "Label Right", 
       "Residual True Positive", 
       "Evaluation Result"
*/


-- select "Evaluation Result" from onto_test group by "Evaluation Result"




select "Matcher", AVG("precision") as "avg(precision)",  AVG("recall") as "avg(recall)",  AVG("f1") as "avg(f1)"


from 

(

select *,

ROUND( (2000 * "precision" * "recall") /  greatest(("precision" + "recall"),1) )/ 1000 as "f1"

from (

select *, 

LEAST( ROUND( ("Evaluation Result = true positive" * 1000) / ("Evaluation Result = true positive" + "Evaluation Result = false positive")  ) / 1000 , 1 ) as "precision" ,

LEAST( ROUND( ("Evaluation Result = true positive" * 1000) / ("Evaluation Result = true positive" + "Evaluation Result = false negative")  ) / 1000 , 1 ) as "recall"

 from (

  select "Matcher", "TestCase", count("TestCase") as "Total",

  COUNT(case when "Residual True Positive" = 'true' then "Residual True Positive" end) as "Residual True Positive = True", 

  COUNT(case when "Residual True Positive" = 'false' then "Residual True Positive" end) as "Residual True Positive = False",


  COUNT(case when "Evaluation Result" = 'true positive' then "Evaluation Result" end) as "Evaluation Result = true positive",
   
  COUNT(case when "Evaluation Result" = 'false positive' then "Evaluation Result" end) as "Evaluation Result = false positive",

  COUNT(case when "Evaluation Result" = 'false negative' then "Evaluation Result" end) as "Evaluation Result = false negative"
      
  FROM onto_test

  where "Track " = 'conference' --and "Matcher" = 'ALIN'

  group by "Matcher", "TestCase"
  
 order by "Matcher"

  ) as semi_result_1
) as semi_result_2

) as semi_result_3


group by "Matcher"
