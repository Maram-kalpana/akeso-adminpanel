const db = require('../config/db');

exports.stats = async (req, res, next) => {
  try {
    const [[counts]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM doctors) AS doctors,
        (SELECT COUNT(*) FROM specialities) AS specialities,
        (SELECT COUNT(*) FROM services) AS services,
        (SELECT COUNT(*) FROM hospitals) AS hospitals,
        (SELECT COUNT(*) FROM health_library) AS health_library,
        (SELECT COUNT(*) FROM our_stories) AS our_stories,
        (SELECT COUNT(*) FROM blogs) AS blogs,
        (SELECT COUNT(*) FROM faqs) AS faqs
    `);
    res.json({ success: true, data: counts });
  } catch (err) {
    next(err);
  }
};
