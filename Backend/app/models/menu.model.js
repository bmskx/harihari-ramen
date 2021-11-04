const sql = require("../database/connection");

exports.createMainMenu = async (menu) => {
  menu.status = true;
  menu.created_at = Date.now();
  menu.updated_at = Date.now();

  try {
    const [result, fields] = await sql.query(
      `INSERT INTO main_menus SET ?`,
      menu
    );

    console.log(
      `Inserted ${result.affectedRows} menu >>> id: ${result.insertId}`
    );
    return { product_id: result.insertId, ...menu };
  } catch (error) {
    console.log(error);
  }
};

exports.createInfoMainMenu = async (info) => {
  try {
    const [result, fields] = await sql.query(
      `INSERT INTO info_main_menus VALUES ?`,
      [info]
    );

    console.log(
      `Inserted ${result.affectedRows} menu's info(s) >>> menu id: ${info[0][0]}`
    );
    return {
      product_id: info[0][0],
      name: info[0][2],
      inserted: result.affectedRows,
    };
  } catch (error) {
    console.log(error);
  }
};

exports.createChoice = async (choice) => {
  choice.status = true;
  choice.created_at = Date.now();
  choice.updated_at = Date.now();

  try {
    const [result, fields] = await sql.query(
      `INSERT INTO ramen_choices SET ?`,
      choice
    );

    console.log(
      `Inserted ${result.affectedRows} choice >>> id: ${result.insertId}`
    );
    return { choice_id: result.insertId, ...choice };
  } catch (error) {
    console.log(error);
  }
};

exports.createInfoChoice = async (info) => {
  try {
    const [result, fields] = await sql.query(
      `INSERT INTO info_ramen_choices VALUES ?`,
      [info]
    );

    console.log(
      `Inserted ${result.affectedRows} choice's info(s) >>> choice id: ${info[0][0]}`
    );
    return {
      choice_id: info[0][0],
      name: info[0][2],
      inserted: result.affectedRows,
    };
  } catch (error) {
    console.log(error);
  }
};

exports.getMainMenus = async (result) => {
  try {
    const [result, fields] = await sql.query(
      `SELECT
        M.product_id,
        M.image_url,
        M.price,
        (
          SELECT
            JSON_OBJECT(
              'name',
              I.name,
              'category',
              I.category,
              'description',
              I.description
            )
          FROM
            info_main_menus I
          WHERE
            I.product_id = M.product_id
            AND I.language = 'en'
            AND I.status = 1
        ) AS en,
        (
          SELECT
            JSON_OBJECT(
              'name',
              I.name,
              'category',
              I.category,
              'description',
              I.description
            )
          FROM
            info_main_menus I
          WHERE
            I.product_id = M.product_id
            AND I.language = 'jp'
            AND I.status = 1
        ) AS jp,
        (
          SELECT
            JSON_OBJECT(
              'name',
              I.name,
              'category',
              I.category,
              'description',
              I.description
            )
          FROM
            info_main_menus I
          WHERE
            I.product_id = M.product_id
            AND I.language = 'th'
            AND I.status = 1
        ) AS th
        FROM
          main_menus M
        WHERE
          M.status = 1`
    );

    console.log(`Selected ${result.length} menu(s)`);
    return result;
  } catch (error) {
    console.log(error);
  }
};
