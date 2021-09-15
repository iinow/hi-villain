var query1 = "{$lookup: {from: 'student', let: { stuId: { $toObjectId: '$studentIds' } },"
        + "pipeline: [{$match: {$expr: { $eq: [ '$_id', '$$stuId' ] },},}, "
        + "{$project: {isSendTemplate: 1,openId: 1,stu_name: '$name',stu_id: '$_id',},},], "
        + "as: 'student',}, }";

console.log(query1)