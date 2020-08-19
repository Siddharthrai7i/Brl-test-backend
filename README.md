https://app.swaggerhub.com/apis-docs/B7192/your-api/2.0.0

Query To Calculate Result:-

```
db.users.aggregate([
  { $match: { responses: { $exists: true } } },
  {
    $unwind: {
      path: "$responses",
      preserveNullAndEmptyArrays: false,
    },
  },
  {
    $lookup: {
      from: "questions",
      let: { questionid: { $toObjectId: "$responses.question" } },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$$questionid", "$_id"],
            },
          },
        },
      ],
      as: "correct",
    },
  },
  { $unwind: "$correct" },
  {
    $addFields: {
      score: {
        $cond: [{ $eq: ["$correct.correct", "$responses.response"] }, 1, 0],
      },
      apti: {
        $cond: [
          {
            $and: [
              { $eq: ["$correct.correct", "$responses.response"] },
              { $eq: ["$correct.category", "apti"] },
            ],
          },
          1,
          0,
        ],
      },
      html: {
        $cond: [
          {
            $and: [
              { $eq: ["$correct.correct", "$responses.response"] },
              { $eq: ["$correct.category", "html"] },
            ],
          },
          1,
          0,
        ],
      },
      css: {
        $cond: [
          {
            $and: [
              { $eq: ["$correct.correct", "$responses.response"] },
              { $eq: ["$correct.category", "css"] },
            ],
          },
          1,
          0,
        ],
      },
      blockchain: {
        $cond: [
          {
            $and: [
              { $eq: ["$correct.correct", "$responses.response"] },
              { $eq: ["$correct.category", "blockchain"] },
            ],
          },
          1,
          0,
        ],
      },
      language: {
        $cond: [
          {
            $and: [
              { $eq: ["$correct.correct", "$responses.response"] },
              { $ne: ["$correct.category", "apti"] },
              { $ne: ["$correct.category", "html"] },
              { $ne: ["$correct.category", "css"] },
              { $ne: ["$correct.category", "blockchain"] },
            ],
          },
          1,
          0,
        ],
      },
    },
  },
  {
    $group: {
      _id: "$_id",
      name: { $first: "$name" },
      phoneNumber: { $first: "$phoneNumber" },
      email: { $first: "$email" },
      rollNumber: { $first: "$rollNumber" },
      branch: { $first: "$branch" },
      skills: { $first: "$skills" },
      switchCounter: { $first: "$switchCounter" },
      score: { $sum: "$score" },
      apti: { $sum: "$apti" },
      html: { $sum: "$html" },
      css: { $sum: "$css" },
      blockchain: { $sum: "$blockchain" },
      language: { $sum: "$language" },
    },
  },
  {
    $out: "subject",
  },
])
```
