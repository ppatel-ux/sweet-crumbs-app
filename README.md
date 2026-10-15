# SweetCrumbsApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Assignment notes

- A new member object is created when a selected member changes. With `OnPush`, replacing the input reference triggers the card update; mutating a property on the same object does not trigger `ngOnChanges` for that input.
- The `@for` block tracks each member by `covers`, which is unique and remains unchanged when a name or job changes. This lets Angular retain the matching card instance while the list is filtered or updated.
- `@for`/`@if` are Angular's built-in control-flow syntax and do not require importing `CommonModule`. `*ngFor`/`*ngIf` are structural directives and need the corresponding directives imported. Both approaches can render the same list and empty state.
- Two differences observed in the comparison: built-in `@for` supports an attached `@empty` block and uses an inline `track` expression; `*ngFor` uses a separate `trackBy` callback and needs `*ngIf` separately for the empty message. The built-in syntax also avoids importing `CommonModule` for these controls.
- `ng-content` projects markup supplied by the caller into the card shell. `ng-template` defines reusable markup inside the component that owns it; here one detail-row template is rendered twice with different context values.
- Emulated view encapsulation scopes component styles. `ViewEncapsulation.None` makes component rules global and can unintentionally style other elements; Shadow DOM isolates styles inside a shadow root.
- The highlight directive uses `Renderer2` to apply and remove host styles. A directive is reusable behavior; CSS `:hover` is simpler when the effect is purely visual and does not need configurable or shared behavior.
- The DevTools screenshot for Chapter 7 must be captured during the browser exercise: inspect an element inside a team card and show Angular's generated `_ngcontent`/`_nghost` attributes while Emulated encapsulation is active.

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
