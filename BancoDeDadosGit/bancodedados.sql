-- Create the database
CREATE DATABASE Acaiteria
DEFAULT CHARACTER SET utf8
DEFAULT COLLATE utf8_general_ci;

-- Use the database
USE Acaiteria;

-- Tabela de Lanches (Produtos já cadastrados)
CREATE TABLE lanches (
    id INT UNIQUE AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(250) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    categoria ENUM('Hamburguer', 'Açaí', 'Bebidas', 'Batata frita', 'Pizza'),
    descricao VARCHAR(300)
) DEFAULT CHARSET = utf8;

-- Inserindo produtos
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

-- Tabela de Pedidos
CREATE TABLE pedidos (
    id INT UNIQUE AUTO_INCREMENT PRIMARY KEY,
    cliente_nome VARCHAR(100) NOT NULL,
    total DECIMAL(10,2),
    forma_pagamento ENUM('Pix', 'Cartão de crédito', 'Boleto') NOT NULL,
    cidade VARCHAR(250) NOT NULL,
    endereco VARCHAR(250) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    itens_pedidos INT,
    status_pedido ENUM('pendente', 'entregue') DEFAULT 'pendente',
    FOREIGN KEY (itens_pedidos) REFERENCES lanches(id)
) DEFAULT CHARSET = utf8;

-- Inserindo pedidos de clientes
INSERT INTO pedidos (cliente_nome, itens_pedidos, total, forma_pagamento, cidade, endereco, cep, status_pedido)
VALUES
('João', 1, 35.50, 'Pix', 'São Paulo', 'Rua A, 123', '01001-000', 'pendente'),
('Maria', 2, 27.90, 'Cartão de crédito', 'Rio de Janeiro', 'Rua B, 456', '20001-000', 'pendente'),
('Carlos', 3, 50.00, 'Pix', 'Belo Horizonte', 'Rua C, 789', '30001-000', 'pendente'),
('Ana', 4, 15.75, 'Boleto', 'Porto Alegre', 'Rua D, 101', '90001-000', 'pendente'),
('Pedro', 5, 22.40, 'Pix', 'Curitiba', 'Rua E, 202', '80001-000', 'pendente'),
('Mariana', 6, 80.00, 'Cartão de crédito', 'Salvador', 'Rua F, 303', '40001-000', 'entregue'),
('Lucas', 7, 45.30, 'Pix', 'Fortaleza', 'Rua G, 404', '60001-000', 'pendente'),
('Julia', 8, 60.50, 'Cartão de crédito', 'Manaus', 'Rua H, 505', '69001-000', 'pendente'),
('Gabriel', 9, 70.20, 'Boleto', 'Brasília', 'Rua I, 606', '70001-000', 'pendente'),
('Larissa', 10, 33.30, 'Cartão de crédito', 'Recife', 'Rua J, 707', '50001-000', 'pendente');

select * from lanches;

select * from pedidos;

-- Filtrar lanches por categoria (por exemplo, categoria 1 para hambúrgueres):
SELECT * FROM lanches WHERE categoria = 1;

-- Filtrar lanches por preço menor que 20.00:
SELECT * FROM lanches WHERE preco < 20.00;

-- Filtrar lanches pela categoria (por exemplo, "hambúrguer"):
SELECT * FROM lanches WHERE categoria = 'Hamburguer';

-- Filtrar lanches pela categoria (por exemplo, "açai"):
SELECT * FROM lanches WHERE categoria = 'Açai';

-- Filtrar lanches pela categoria (por exemplo, "bebidas"):
SELECT * FROM lanches WHERE categoria = 'bebidas';

-- Filtrar lanches por nome (por exemplo, "açai"):
SELECT * FROM lanches WHERE categoria = 2 AND titulo LIKE '%açai%';

-- Filtrar lanches por nome (por exemplo, "batata frita"):
SELECT * FROM lanches WHERE categoria = 4 AND titulo LIKE '%batata frita%';

-- Listar todos os lanches ordenados por preço crescente:
SELECT * FROM lanches ORDER BY preco ASC;

-- Filtrar lanches por categoria e preço menor que 15.00:
SELECT * FROM lanches WHERE categoria = 2 AND preco < 15.00;

-- Listar todos os lanches ordenados por titulo crescente:
SELECT * FROM lanches ORDER BY titulo ASC;

-- Filtrar lanches por nome (por exemplo, "refrigerante"):
SELECT * FROM lanches WHERE categoria = 3 AND titulo LIKE '%refrigerante%';

-- Filtrar lanches por nome (por exemplo, "pizza"):
SELECT * FROM lanches WHERE categoria = 5 AND titulo LIKE '%pizza%';

-- Filtrar lanches por preço entre 10.00 e 20.00:
SELECT * FROM lanches WHERE preco BETWEEN 10.00 AND 20.00;

-- Listar todos os lanches ordenados por categoria e título
SELECT titulo, preco, categoria
FROM lanches
ORDER BY categoria, titulo;

-- Listar todos os lanches com seus preços, incluindo o nome da categoria
SELECT lanches.titulo, lanches.preco, lanches.categoria
FROM lanches;

-- Contar quantos lanches existem em cada categoria:
SELECT lanches.categoria AS categoria, COUNT(lanches.id) AS total_lanches
FROM lanches group by lanches.categoria;

-- Listar todos os lanches de categoria 1 e 2:
SELECT titulo, preco, categoria
FROM lanches
WHERE categoria IN (1, 2);

-- listar todos os lanches de categoria 1 e 2 em uma única lista, ordenados por preço decrescente:
SELECT titulo, preco FROM lanches WHERE categoria = 1
UNION ALL
SELECT titulo, preco FROM lanches WHERE categoria = 2
ORDER BY preco DESC;

-- atualiza o pedido do cliente que esta pendente para entregue:
update pedidos set status_pedido = 'entregue' where pedidos.id = 2;

-- filtrar por status de entrega nesse exemlpo esta entregue:
select * from pedidos
where status_pedido = 'entregue';

-- filtrar por status de entrega nesse exemlpo esta pendente:
select * from pedidos
where status_pedido = 'pendente' ;

-- exibir quantos pedidos estão pendentes
SELECT COUNT(status_pedido) as pedidos_pendentes from pedidos where status_pedido = 'pendente';

-- exibir quantos pedidos foram entregues
SELECT COUNT(status_pedido) as pedidos_entregues from pedidos where status_pedido = 'entregue';