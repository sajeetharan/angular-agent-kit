---
title: Use Immutable Data Patterns
impact: CRITICAL
impactDescription: enables OnPush detection, prevents subtle bugs
tags: change-detection, immutable, data-patterns, onpush
---

## Use Immutable Data Patterns

Always use immutable data patterns with OnPush change detection. Mutating objects or arrays won't trigger change detection because the reference stays the same.

**Incorrect (mutation - OnPush won't detect changes):**

```typescript
@Component({
  selector: 'app-todo-list',
  template: `
    <div *ngFor="let todo of todos; trackBy: trackById">
      {{ todo.title }} - {{ todo.completed ? 'Done' : 'Pending' }}
    </div>
    <button (click)="addTodo()">Add</button>
    <button (click)="toggleFirst()">Toggle First</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent {
  todos: Todo[] = [];
  
  addTodo() {
    // WRONG: Mutating array - view won't update!
    this.todos.push({ id: Date.now(), title: 'New Todo', completed: false });
  }
  
  toggleFirst() {
    // WRONG: Mutating object - view won't update!
    this.todos[0].completed = !this.todos[0].completed;
  }
}
```

**Correct (immutable - creates new references):**

```typescript
@Component({
  selector: 'app-todo-list',
  template: `
    @for (todo of todos; track todo.id) {
      <div>{{ todo.title }} - {{ todo.completed ? 'Done' : 'Pending' }}</div>
    }
    <button (click)="addTodo()">Add</button>
    <button (click)="toggleFirst()">Toggle First</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent {
  todos: Todo[] = [];
  
  addTodo() {
    // Correct: New array reference
    this.todos = [
      ...this.todos,
      { id: Date.now(), title: 'New Todo', completed: false }
    ];
  }
  
  toggleFirst() {
    // Correct: New array with new object
    this.todos = this.todos.map((todo, index) =>
      index === 0 ? { ...todo, completed: !todo.completed } : todo
    );
  }
}
```

**With Signals (Angular 17+) - recommended:**

```typescript
@Component({
  selector: 'app-todo-list',
  template: `
    @for (todo of todos(); track todo.id) {
      <div>{{ todo.title }} - {{ todo.completed ? 'Done' : 'Pending' }}</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent {
  todos = signal<Todo[]>([]);
  
  addTodo() {
    // update() provides immutable update pattern
    this.todos.update(current => [
      ...current,
      { id: Date.now(), title: 'New Todo', completed: false }
    ]);
  }
  
  toggleTodo(id: number) {
    this.todos.update(current =>
      current.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }
}
```

**Common immutable patterns:**

```typescript
// Adding to array
const newArray = [...oldArray, newItem];

// Removing from array
const filtered = oldArray.filter(item => item.id !== idToRemove);

// Updating item in array
const updated = oldArray.map(item =>
  item.id === targetId ? { ...item, ...changes } : item
);

// Updating object
const newObj = { ...oldObj, propertyToChange: newValue };

// Deep update
const nested = {
  ...oldObj,
  child: {
    ...oldObj.child,
    grandchild: newValue
  }
};
```

Reference: [Angular Change Detection](https://angular.dev/best-practices/skipping-subtrees)
