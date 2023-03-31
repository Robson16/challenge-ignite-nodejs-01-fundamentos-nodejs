import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database;

export const routes = [
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { title, description } = request.body;

      if (!title || !description) {
        return response.writeHead(422).end(JSON.stringify({
          message: "Title and description are required."
        }));
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      database.insert('tasks', task);

      return response.writeHead(201).end();
    }
  },
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { search } = request.query;

      const tasks = database.select(
        'tasks',
        search
          ? { title: search, description: search, }
          : null
      );

      return response
        .end(JSON.stringify(tasks));
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;
      const { title, description } = request.body;

      const idExist = database.select('tasks', { id });

      if (idExist.length < 1) {
        return response.writeHead(404).end(JSON.stringify({
          message: "Requested task not found."
        }));
      }

      if (!title || !description) {
        return response.writeHead(422).end(JSON.stringify({
          message: "Title and description are required."
        }));
      }

      database.update('tasks', id, {
        title,
        description,
        updated_at: new Date(),
      });

      return response.writeHead(204).end();
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;

      const idExist = database.select('tasks', { id });

      if (idExist.length < 1) {
        return response.writeHead(404).end(JSON.stringify({
          message: "Requested task not found."
        }));
      }

      database.delete('tasks', id);

      return response.writeHead(204).end();
    }
  }, {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (request, response) => {
      const { id } = request.params;

      const idExist = database.select('tasks', { id });

      if (idExist.length < 1) {
        return response.writeHead(404).end(JSON.stringify({
          message: "Requested task not found."
        }));
      }

      database.update('tasks', id, {
        completed_at: new Date(),
      });

      return response.writeHead(204).end();
    }
  }
]