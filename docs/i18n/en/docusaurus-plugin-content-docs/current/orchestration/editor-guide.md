---
title: Use the visual orchestration editor
description: Create an executable multi-agent workflow, configure its nodes, save it, and run a test.
---

# Use the visual orchestration editor

Agent orchestration uses a visual workflow to organize agents and control nodes. It defines how a task receives input, follows branches, merges results, and returns an answer.

## Prerequisites

Before you begin, make sure that:

- You have created and selected a project.
- The agents required by the workflow have been created and have valid model and prompt configurations.
- Your account has permission to edit the project.

## 1. Create an orchestration

Open **Agent Orchestration**, then select **New Orchestration** in the upper-right corner.

<img src="/img/orchestration/editor/create-orchestration-form.png"
     alt="New orchestration form"
     width="80%" />

- **Orchestration identifier**: A unique identifier used internally by the system. Use lowercase letters, numbers, and underscores, such as `api_workflow`.
- **Display name**: The user-facing name of the orchestration.
- **Description**: A short explanation of what the orchestration does.
- **Debug preset prompts**: Shortcut prompts shown on the test page for frequently repeated validation tasks.

Select **Confirm** to create an empty orchestration and open the editor.

<img src="/img/orchestration/editor/empty-orchestration-editor.png"
     alt="Empty orchestration editor"
     width="100%" />

An empty orchestration cannot run, so the editor marks it as temporarily non-executable. Each time you save, the system compiles the workflow and lists any errors. An executable workflow must satisfy at least the following requirements:

- It contains exactly one Start node and one End node. Start cannot have an incoming edge, and End cannot have an outgoing edge.
- All nodes and edges are valid. Every node must be reachable from Start, and End must also be reachable.
- The outer workflow cannot contain a cycle. Use a Loop or Iteration node when repeated execution is required.
- Every Agent Task node references an available agent in the current project with a valid configuration.

## 2. Edit the workflow

The toolbar displays the orchestration name, node and edge counts, and current compilation status. It also provides undo, redo, import, export, execution control, and save actions.

When **Allow execution** is disabled, the orchestration does not accept new runs even if it compiles successfully. **Maximum concurrency** limits how many nodes can run at the same time in one workflow execution. The default is `8`, and the allowed range is `1`–`128`.

After you change the workflow, the editor displays an “Unsaved changes” indicator. Select **Save** to persist the graph and run the compilation check again.

**Export** downloads a JSON file containing the nodes, edges, and workflow settings. **Import** replaces the current canvas with a compatible JSON workflow. You must still select **Save** after importing.

The node library is on the left. Drag a node onto the canvas to add it, drag between node ports to create an edge, and select a node to edit it in the configuration panel on the right.

## 3. Configure nodes

### Start node

<img src="/img/orchestration/editor/start-node-config.png"
     alt="Start node configuration"
     width="80%" />

Start is the workflow's only entry point. It defines the input variables accepted at runtime. Each variable can have a name, type, required flag, default value, and description. On the test page, chat text and workspace files enter the workflow through this node. The workflow does not start if a required variable is missing.

### Agent Task node

<img src="/img/orchestration/editor/agent-task-node-config.png"
     alt="Agent Task node configuration"
     width="80%" />

An Agent Task node invokes a configured agent from the current project. Select an agent, then describe the work for that node under **Agent instruction**. If you do not specify input content, the node uses the primary output of its upstream node.

Use the variable selector to insert Start variables, global variables, or outputs from upstream nodes. A variable is inserted as `{{ variable.path }}` and replaced with its actual value at runtime.

<img src="/img/orchestration/editor/open-variable-selector.png"
     alt="Open the variable selector"
     width="80%" />

<img src="/img/orchestration/editor/select-variable-path.png"
     alt="Select a variable path"
     width="80%" />

### Condition node

<img src="/img/orchestration/editor/condition-node-config.png"
     alt="Condition node configuration"
     width="80%" />

A Condition node evaluates its configured rules and selects either the `true` or `false` output port. You can combine multiple rules and require either all rules (AND) or any rule (OR) to match. Each side of a comparison can use a variable, or you can compare a variable with a fixed value. Connect downstream nodes to the appropriate output port.

### Join node

<img src="/img/orchestration/editor/join-node-config.png"
     alt="Join node configuration"
     width="80%" />

A Join node merges multiple upstream branches. Input branch names must correspond to the node's input ports. **Continue condition** can wait for every branch or continue when any branch completes. **Result format** can produce an object keyed by branch name, a list, the first result, or the most frequently occurring result.

### Approval node

<img src="/img/orchestration/editor/approval-node-config.png"
     alt="Approval node configuration"
     width="80%" />

An Approval node pauses the workflow until a user selects **Approve** or **Reject**, then continues through the `approved` or `rejected` port. You can configure the waiting message and the context shown to the reviewer. If **Auto approve** or a preset decision is configured, the node does not wait for user input.

### Answer node

<img src="/img/orchestration/editor/answer-node-config.png"
     alt="Answer node configuration"
     width="80%" />

An Answer node creates text to display to the user. Its response can include variables and upstream node outputs. Objects and lists are converted to displayable text at runtime. The workflow can continue to other nodes after an Answer node.

### End node

<img src="/img/orchestration/editor/end-node-config.png"
     alt="End node configuration"
     width="80%" />

End is the workflow's only exit. It completes the execution and returns the primary value it receives as the final workflow result. An End node can have incoming edges but cannot connect to another downstream node.

## 4. Save and validate the workflow

After configuring the nodes and edges, select **Save**. The editor displays “Workflow can run” when compilation succeeds. If the workflow remains in editing status, correct the compilation errors listed on the page.

<img src="/img/orchestration/editor/executable-workflow.png"
     alt="Executable workflow"
     width="100%" />

## 5. Run a test

Return to the Agent Orchestration list and select **Test** for the orchestration. Enter a task and send it to trigger the workflow from the Start node.

<img src="/img/orchestration/editor/orchestration-test-page.png"
     alt="Orchestration test page"
     width="100%" />

During execution, the page displays node states and the final answer. If the workflow reaches an Approval node, approve or reject it from the current execution.

<img src="/img/orchestration/editor/orchestration-execution-result.png"
     alt="Orchestration execution result"
     width="80%" />

Select **Execution flow** at the bottom of the page to view the nodes visited by the current run. Select a node to inspect its inputs, outputs, and trace information.

<img src="/img/orchestration/editor/execution-flow-details.png"
     alt="Execution flow details"
     width="80%" />

## 6. View conversation history

Open the **History** tab to view previous sessions and their execution counts. Select **Continue** to restore a session's context and continue testing.

<img src="/img/orchestration/editor/conversation-history.png"
     alt="Conversation history"
     width="100%" />

## Next steps

- For node selection, data contracts, and complexity control, see [Design multi-agent orchestration](./design).
- To connect agents through a standard collaboration protocol, see [A2A collaboration](./a2a).
- To inspect platform-level metrics and traces, see [Observability](../operations/observability).
