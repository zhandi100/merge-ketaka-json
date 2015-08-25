Merge Ketaka JSON into Jiangkangyur XML

raw data and issue from Lamalien
https://drive.google.com/folderview?id=0B3g92NNibDrQfmJWVHR3TUpSNFRpanRQS3RkZkp3UFBFTnV3dVpLaW55RFJXcU1rSTlkUHc&usp=sharing_eid

first step
=====
input: ketaka_json_lst and jiangkangyur.kdb (used by ketaka)
output: lstfilename+".json"

    node gen lstfilename jiangkangyur201504


second step
=====
input: combined json, files in before_xml
output: merged_xml 

    node merge combined_json