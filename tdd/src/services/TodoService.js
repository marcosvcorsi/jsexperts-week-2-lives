class TodoService {
  constructor({ todoRepository }) {
    this.todoRepository = todoRepository;
  }

  create(todoItem) {
    if(!todoItem.isValid()) {
      return {
        error: {
          message: 'invalid data',
          data: todoItem
        }
      }
    }

    const { when } = todoItem;
    const today = new Date();

    const todo = {
      ...todoItem,
      status: when > today ? 'pending' : 'late'
    }

    return this.todoRepository.create(todo);
  }

  findAll() {
    return this.todoRepository.findAll().map(result => {
      const {meta, $loki, ...rest } = result;

      return rest;
    });
  }
}

module.exports = TodoService;