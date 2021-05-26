# kpi-chart



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type     | Default     |
| -------- | --------- | ----------- | -------- | ----------- |
| `data`   | `data`    | TODO :      | `string` | `undefined` |


## Events

| Event         | Description | Type                                                           |
| ------------- | ----------- | -------------------------------------------------------------- |
| `configSaved` |             | `CustomEvent<{ mapping: { name: string; icon: string; }[]; }>` |


## Dependencies

### Depends on

- [kpi-card](../kpi-card)
- [kpi-config](../kpi-config)

### Graph
```mermaid
graph TD;
  kpi-chart --> kpi-card
  kpi-chart --> kpi-config
  kpi-config --> fas-icon-picker
  style kpi-chart fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
