import db from '../config/db.js';

const favoriteRepository = {
	getImageInternalIdStmt: db.prepare(`SELECT id FROM images WHERE image_id = ? AND deleted_at IS NULL;`),

	getFavoritesStmt: db.prepare(`
  SELECT i.id, i.image_id, i.user_id, i.title, i.file_path, i.uploaded_at
  FROM images i
  JOIN favorites f ON i.id = f.image_id
  WHERE f.user_id = ? AND i.deleted_at IS NULL;
  `),

	addFavoriteStmt: db.prepare(`INSERT INTO favorites (user_id, image_id) VALUES (?, ?);`),

	removeFavoriteStmt: db.prepare(`DELETE FROM favorites WHERE user_id = ? AND image_id = ?;`),
}

export default favoriteRepository;