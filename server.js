const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API de Tarefas rodando com Prisma!' });
});

// GET /tarefas - Listar todas as tarefas
app.get('/tarefas', async (req, res) => {
  try {
    const tarefas = await prisma.tarefa.findMany({
      orderBy: {
        criada_em: 'desc'
      }
    });
    res.json(tarefas);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

// POST /tarefas - Adicionar nova tarefa
app.post('/tarefas', async (req, res) => {
  const { descricao } = req.body;
  
  if (!descricao || descricao.trim() === '') {
    return res.status(400).json({ error: 'Descrição é obrigatória' });
  }
  
  try {
    const novaTarefa = await prisma.tarefa.create({
      data: {
        descricao
      }
    });
    
    res.status(201).json({
      ...novaTarefa,
      message: 'Tarefa criada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao inserir tarefa:', error);
    res.status(500).json({ error: 'Erro ao inserir tarefa' });
  }
});

// DELETE /tarefas/:id - Remover tarefa
app.delete('/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.tarefa.delete({
      where: {
        id: parseInt(id)
      }
    });
    
    res.json({ message: 'Tarefa deletada com sucesso!' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({ error: 'Erro ao deletar tarefa' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🚀 Servidor rodando com sucesso!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('\n📋 Endpoints disponíveis:');
  console.log(`  GET    http://localhost:${PORT}/          - Teste da API`);
  console.log(`  GET    http://localhost:${PORT}/tarefas   - Listar todas as tarefas`);
  console.log(`  POST   http://localhost:${PORT}/tarefas   - Criar nova tarefa`);
  console.log(`  DELETE http://localhost:${PORT}/tarefas/:id - Deletar tarefa\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});