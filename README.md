Merge Ketaka JSON into Jiangkangyur XML

raw data and issue from Lamalien
https://drive.google.com/folderview?id=0B3g92NNibDrQfmJWVHR3TUpSNFRpanRQS3RkZkp3UFBFTnV3dVpLaW55RFJXcU1rSTlkUHc&usp=sharing_eid

first step
=====
input: ketaka_json  and jiangkangyur.kdb (used by ketaka)
output: before_json (add before text)

    node gen_before_json jiangkangyur201504 

second step
=====
input: before_json , before_xml
output: merged_xml 

    node domerge