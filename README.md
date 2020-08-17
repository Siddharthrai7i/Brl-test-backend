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
    },
  },
  {
    $group: {
      _id: "$_id",
      name: { $first: "$name" },
      phoneNumber: { $first: "$phoneNumber" },
      email: { $first: "$phoneNumber" },
      score: { $sum: "$score" },
    },
  },
  {
    $out: "flat",
  },
]);

```
