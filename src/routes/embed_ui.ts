import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as fs from 'fs';
import * as path from 'path';

const uiRouter = new Hono();

uiRouter.get('/', async (c) => {

  try {
    const filePath = path.join(process.cwd(), '/src/view/main_alt.html');
    let fileContent = fs.readFileSync(filePath, 'utf-8');

    // Text color
    const textColorQuery = c.req.query('text_clr') || '#ffffff';
    const textColor = textColorQuery.startsWith('#') || !/^[0-9a-fA-F]{3,6}$/.test(textColorQuery) ? textColorQuery : `#${textColorQuery}`;
    fileContent = fileContent.replace(/'@text_clr'/g, textColor);

    // Background color
    const primaryBgQuery = c.req.query('primary_bg_clr') || '#5d48bf';
    console.log(primaryBgQuery, c.req.query('primary_bg_clr'));
    const primaryBgColor = primaryBgQuery.startsWith('#') || !/^[0-9a-fA-F]{3,6}$/.test(primaryBgQuery) ? primaryBgQuery : `#${primaryBgQuery}`;
    fileContent = fileContent.replace(/'@primary_bg_clr'/g, primaryBgColor);

    // Button color
    const btnColorQuery = c.req.query('btn_clr') || '#2ab7ea';
    const btnCyanColor = btnColorQuery.startsWith('#') || !/^[0-9a-fA-F]{3,6}$/.test(btnColorQuery) ? btnColorQuery : `#${btnColorQuery}`;
    fileContent = fileContent.replace(/'@btn_clr'/g, btnCyanColor);
    return c.html(fileContent);
    // return c.json({ success: true, rides });
  } catch (err) {
    console.error('Get rides error:', err);
    throw new HTTPException(500, { message: 'Server error' });  
  }
});

export default uiRouter;