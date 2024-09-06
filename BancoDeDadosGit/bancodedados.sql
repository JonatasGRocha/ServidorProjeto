-- Alterar o usuário root para usar autenticação mysql_native_password
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
SELECT User FROM mysql.user;

-- Criar o banco de dados
CREATE DATABASE Acaiteria
DEFAULT CHARACTER SET utf8
DEFAULT COLLATE utf8_general_ci;

-- Usar o banco de dados
USE Acaiteria;

-- Criar a tabela de lanches
CREATE TABLE lanches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(250) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    categoria ENUM('Hamburguer', 'Açaí', 'Bebidas', 'Batata frita'),
    descricao VARCHAR(300)
) DEFAULT CHARSET = utf8;

-- Inserir produtos na tabela de lanches
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

-- Criar a tabela de pedidos
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_nome VARCHAR(100) NOT NULL,
    total DECIMAL(10,2),
    forma_pagamento ENUM('Pix', 'Cartão de crédito', 'Boleto') NOT NULL,
    cidade VARCHAR(250) NOT NULL,
    endereco VARCHAR(250) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_pedido ENUM('pendente', 'entregue') DEFAULT 'pendente'
) DEFAULT CHARSET = utf8;

-- Criar a tabela intermediária para relacionar pedidos e lanches
CREATE TABLE pedido_lanches (
    pedido_id INT,
    lanche_id INT,
    quantidade INT DEFAULT 1,
    PRIMARY KEY (pedido_id, lanche_id),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (lanche_id) REFERENCES lanches(id) ON DELETE CASCADE
) DEFAULT CHARSET = utf8;

-- Inserir pedidos de clientes
INSERT INTO pedidos (cliente_nome, total, forma_pagamento, cidade, endereco, cep, status_pedido)
VALUES
('João', 35.50, 'Pix', 'São Paulo', 'Rua A, 123', '01001-000', 'pendente'),
('Maria', 27.90, 'Cartão de crédito', 'Rio de Janeiro', 'Rua B, 456', '20001-000', 'pendente'),
('Carlos', 50.00, 'Pix', 'Belo Horizonte', 'Rua C, 789', '30001-000', 'pendente'),
('Ana', 15.75, 'Boleto', 'Porto Alegre', 'Rua D, 101', '90001-000', 'pendente'),
('Pedro', 22.40, 'Pix', 'Curitiba', 'Rua E, 202', '80001-000', 'pendente'),
('Mariana', 80.00, 'Cartão de crédito', 'Salvador', 'Rua F, 303', '40001-000', 'entregue'),
('Lucas', 45.30, 'Pix', 'Fortaleza', 'Rua G, 404', '60001-000', 'pendente'),
('Julia', 60.50, 'Cartão de crédito', 'Manaus', 'Rua H, 505', '69001-000', 'pendente'),
('Gabriel', 70.20, 'Boleto', 'Brasília', 'Rua I, 606', '70001-000', 'pendente'),
('Larissa', 33.30, 'Cartão de crédito', 'Recife', 'Rua J, 707', '50001-000', 'pendente');

-- Inserir itens nos pedidos
INSERT INTO pedido_lanches (pedido_id, lanche_id, quantidade)
VALUES
(1, 1, 2),  -- João pediu 2 X-Burgers
(1, 4, 1),  -- João também pediu 1 Batata Frita Grande
(2, 7, 1),  -- Maria pediu 1 Guaraná Antarctica
(2, 8, 1),  -- Maria também pediu 1 Batata Frita com Cheddar
(3, 11, 1), -- Carlos pediu 1 Água Mineral
(4, 5, 2),  -- Ana pediu 2 Double Cheeseburgers
(5, 9, 1),  -- Pedro pediu 1 Hamburger de Frango
(6, 15, 1), -- Mariana pediu 1 Açaí com Nutella
(7, 3, 2),  -- Lucas pediu 2 Sucos de Laranja
(8, 10, 1), -- Julia pediu 1 Açaí com Paçoca
(9, 12, 1), -- Gabriel pediu 1 Batata Frita com Bacon
(10, 14, 1); -- Larissa pediu 1 Açaí com Leite em Pó

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