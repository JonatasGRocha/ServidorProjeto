ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
SELECT User FROM mysql.user;
 
-- Criar o banco de dados
CREATE DATABASE Acaiteria
DEFAULT CHARACTER SET utf8
DEFAULT COLLATE utf8_general_ci;

-- Usar o banco de dados
USE Acaiteria;

-- Criar a tabela de clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone INT(20) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    cep INT(10) NOT NULL
);

-- Inserir clientes na tabela de clientes
INSERT INTO clientes (nome, email, telefone, endereco, cidade, cep)
VALUES
('João', 'joao@example.com', 111111111, 'Rua A, 123', 'São Paulo', 01001-000),
('Maria', 'maria@example.com', 222222222, 'Rua B, 456', 'Rio de Janeiro', 20001-000),
('Carlos', 'carlos@example.com', 333333333, 'Rua C, 789', 'Belo Horizonte', 30001-000),
('Ana', 'ana@example.com', 444444444, 'Rua D, 101', 'Porto Alegre', 90001-000),
('Pedro', 'pedro@example.com', 555555555, 'Rua E, 202', 'Curitiba', 80001-000);

-- Criar a tabela de lanches
CREATE TABLE IF NOT EXISTS lanches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(250) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    categoria ENUM('Hamburguer', 'Açaí', 'Bebidas', 'Batata frita'),
    descricao VARCHAR(300)
) DEFAULT CHARSET = utf8;

-- Criar a tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    total DECIMAL(10, 2),
    forma_pagamento ENUM('Pix', 'Cartão de crédito', 'Boleto') NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_pedido ENUM('pendente', 'entregue') DEFAULT 'pendente',
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
) DEFAULT CHARSET = utf8;

-- Criar a tabela intermediária para relacionar pedidos e lanches, sem o campo quantidade
CREATE TABLE IF NOT EXISTS pedido_lanches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT,
    lanche_id INT,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (lanche_id) REFERENCES lanches(id) ON DELETE CASCADE
);

INSERT INTO lanches (titulo, preco, categoria, descricao)
VALUES
('X-Burger', 17.00, 'Hamburguer', 'Hamburger com queijo, bacon e maionese especial'),
('Açaí com Banana', 11.50, 'Açaí', 'Açaí com pedaços de banana'),
('Suco de Laranja', 7.00, 'Bebidas', 'Suco natural de laranja 300ml'),
('Batata Frita Grande', 10.00, 'Batata frita', 'Porção grande de batata frita'),
('Double Cheeseburger', 19.50, 'Hamburguer', 'Hamburger duplo com queijo'),
('Açaí com Morango', 13.00, 'Açaí', 'Açaí com pedaços de morango'),
('Guaraná Antarctica', 5.00, 'Bebidas', 'Lata de Guaraná Antarctica 350ml'),
('Batata Frita com Cheddar', 9.00, 'Batata frita', 'Batata frita com cheddar'),
('Hamburger de Frango', 16.00, 'Hamburguer', 'Hamburger de frango com alface e maionese'),
('Açaí com Paçoca', 14.00, 'Açaí', 'Açaí com paçoca e leite condensado'),
('Água Mineral', 3.00, 'Bebidas', 'Garrafa de água mineral 500ml'),
('Batata Frita com Bacon', 11.00, 'Batata frita', 'Batata frita com bacon'),
('Hamburger Vegetariano', 18.00, 'Hamburguer', 'Hamburger vegetariano com legumes'),
('Açaí com Nutella', 15.50, 'Açaí', 'Açaí com Nutella e granola'),
('Chá Gelado', 6.00, 'Bebidas', 'Chá gelado de limão 300ml'),
('Batata Frita com Molho Ranch', 10.50, 'Batata frita', 'Batata frita com molho ranch'),
('Hamburger de Costela', 20.00, 'Hamburguer', 'Hamburger de costela com cebola caramelizada'),
('Açaí com Leite em Pó', 13.50, 'Açaí', 'Açaí com leite em pó e morango'),
('Refrigerante de Limão', 5.00, 'Bebidas', 'Lata de refrigerante de limão 350ml'),
('Batata Frita com Alho', 9.50, 'Batata frita', 'Batata frita com alho frito');

-- Inserir alguns pedidos na tabela de pedidos
INSERT INTO pedidos (cliente_id, total, forma_pagamento, status_pedido)
VALUES
(1, 17.00, 'Pix', 'pendente'), 
(2, 20.00, 'Cartão de crédito', 'pendente'), 
(3, 39.00, 'Pix', 'pendente'), 
(4, 18.00, 'Boleto', 'pendente'), 
(5, 5.00, 'Pix', 'pendente');

-- Inserir os lanches relacionados aos pedidos na tabela de pedido_lanches, sem a quantidade
INSERT INTO pedido_lanches (pedido_id, lanche_id)
VALUES
(1, 1), -- Pedido 1: João comprou 1 X-Burger
(2, 4), -- Pedido 2: Maria comprou 1 Batata Frita Grande
(3, 6), -- Pedido 3: Carlos comprou 1 Açaí com Morango
(4, 5), -- Pedido 4: Ana comprou 1 Double Cheeseburger
(5, 3); -- Pedido 5: Pedro comprou 1 Suco de Laranja

ALTER TABLE lanches ADD COLUMN imagem VARCHAR(255);

UPDATE lanches SET imagem = '/assets/images/Rectangle 89 (1).png' WHERE id = 1;
UPDATE lanches SET imagem = '/assets/images/Rectangle 89 (2).png' WHERE id = 2;
UPDATE lanches SET imagem = '/assets/images/laranja.jpg' WHERE id = 3;
UPDATE lanches SET imagem = '/assets/images/batata-frita.jpg' WHERE id = 4;
UPDATE lanches SET imagem = '/assets/images/laranja.jpg' WHERE id = 5;
UPDATE lanches SET imagem = '/assets/images/Rectangle 89 (2).png' WHERE id = 6;
UPDATE lanches SET imagem = '/assets/images/laranja.jpg' WHERE id = 7;
UPDATE lanches SET imagem = '/assets/images/batata-frita.jpg' WHERE id = 8;
UPDATE lanches SET imagem = '/assets/images/laranja.jpg' WHERE id = 9;
UPDATE lanches SET imagem = '/assets/images/Rectangle 89 (2).png' WHERE id = 10;
UPDATE lanches SET imagem = '/assets/images/laranja.jpg' WHERE id = 11;
UPDATE lanches SET imagem = '/assets/images/batata-frita.jpg' WHERE id = 12;
UPDATE lanches SET imagem = '/assets/images/laranja.jpg' WHERE id = 13;
UPDATE lanches SET imagem = '/assets/images/Rectangle 89 (2).png' WHERE id = 14;
UPDATE lanches SET imagem = '/assets/images/laranja.jpg' WHERE id = 15;
UPDATE lanches SET imagem = '/assets/images/batata-frita.jpg' WHERE id = 16;
UPDATE lanches SET imagem = '/assets/images/laranja.jpg' WHERE id = 17;
UPDATE lanches SET imagem = '/assets/images/Rectangle 89 (2).png' WHERE id = 18;


SELECT COUNT(cliente_id) AS total_pedidos FROM pedidos WHERE cliente_id = 2;

-- Listar todos os lanches
SELECT * FROM lanches;

-- Listar todos os pedidos
SELECT * FROM pedidos;

-- Filtrar lanches por categoria (por exemplo, categoria 'Hamburguer'):
SELECT * FROM lanches WHERE categoria = 'Hamburguer';

-- Filtrar lanches por preço menor que 20.00
SELECT * FROM lanches WHERE preco < 20.00;

-- Filtrar lanches por categoria 'Açaí':
SELECT * FROM lanches WHERE categoria = 'Açaí';

-- Filtrar lanches por categoria 'Bebidas':
SELECT * FROM lanches WHERE categoria = 'Bebidas';

-- Filtrar lanches por nome (por exemplo, 'Açaí'):
SELECT * FROM lanches WHERE categoria = 'Açaí' AND titulo LIKE '%Açaí%';

-- Filtrar lanches por nome (por exemplo, 'Batata Frita'):
SELECT * FROM lanches WHERE categoria = 'Batata frita' AND titulo LIKE '%Batata Frita%';

-- Listar todos os lanches ordenados por preço crescente:
SELECT * FROM lanches ORDER BY preco ASC;

-- Filtrar lanches por categoria 'Açaí' e preço menor que 15.00:
SELECT * FROM lanches WHERE categoria = 'Açaí' AND preco < 15.00;

-- Listar todos os lanches ordenados por título crescente:
SELECT * FROM lanches ORDER BY titulo ASC;

-- Filtrar lanches por nome (por exemplo, 'Refrigerante'):
SELECT * FROM lanches WHERE categoria = 'Bebidas' AND titulo LIKE '%Refrigerante%';

-- Filtrar lanches por nome (por exemplo, 'Pizza'):
SELECT * FROM lanches WHERE categoria = 'Pizza' AND titulo LIKE '%Pizza%';

-- Filtrar lanches por preço entre 10.00 e 20.00:
SELECT * FROM lanches WHERE preco BETWEEN 10.00 AND 20.00;

-- Listar todos os lanches ordenados por categoria e título:
SELECT titulo, preco, categoria
FROM lanches
ORDER BY categoria, titulo;

-- Listar todos os lanches com seus preços, incluindo o nome da categoria:
SELECT lanches.titulo, lanches.preco, lanches.categoria
FROM lanches;

-- Contar quantos lanches existem em cada categoria:
SELECT categoria, COUNT(id) AS total_lanches
FROM lanches
GROUP BY categoria;

-- Listar todos os lanches de categoria 'Hamburguer' e 'Açaí':
SELECT titulo, preco, categoria
FROM lanches
WHERE categoria IN ('Hamburguer', 'Açaí');

-- Listar todos os lanches de categoria 'Hamburguer' e 'Açaí' em uma única lista, ordenados por preço decrescente:
SELECT titulo, preco FROM lanches WHERE categoria = 'Hamburguer'
UNION ALL
SELECT titulo, preco FROM lanches WHERE categoria = 'Açaí'
ORDER BY preco DESC;

-- Atualizar o pedido do cliente com id = 2 para 'entregue':
UPDATE pedidos SET status_pedido = 'entregue' WHERE id = 2;

-- Filtrar pedidos com status 'entregue':
SELECT * FROM pedidos WHERE status_pedido = 'entregue';

-- Filtrar pedidos com status 'pendente':
SELECT * FROM pedidos WHERE status_pedido = 'pendente';

-- Exibir quantos pedidos estão pendentes:
SELECT COUNT(*) AS pedidos_pendentes FROM pedidos WHERE status_pedido = 'pendente';

-- Exibir quantos pedidos foram entregues:
SELECT COUNT(*) AS pedidos_entregues FROM pedidos WHERE status_pedido = 'entregue';
