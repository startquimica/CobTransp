-- Move a senha seed do ADMIN_TENANT para uma migration incremental sem alterar o checksum da V1.
UPDATE usuarios
SET senha = '$2a$10$vJU.z7RSav2QAKhUzwUuoOxXvQdbc0lUkFZR26lHRvecSTI6Hb7Ie'
WHERE email = 'admin@startquimica.com.br'
  AND role = 'ADMIN_TENANT'
  AND senha = '$2a$10$2H6O9oXF3uOZhM/KzV2.bOA7tVqj.3Aqy.s1.gV7F./Vn4Q5iUe/2';

