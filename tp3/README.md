# SGI 2022/2023 - TP3

## Group: T03G04

| Name            | Number    | E-Mail                 |
| --------------- | --------- | ---------------------- |
| Lucas Santos    | 201904517 | 201904517@edu.fe.up.pt |
| Mário Travassos | 201905871 | 201904517@edu.fe.up.pt |

----
## Project information

- Rules implemented correctly
- Code documentation
- Segregation of classes according to the role they play in the application
- Ability to generate new gameplay environment, with the board and auxiliary boards in different positions, via importing an sxs scene - only the bare minimum is hardwired
- Efficient algorithms for most game state calculations
- Interaction with the scene via toggles in the interface
- The application runs continuously without any performance issues
- Some basic shading performed for the highlighting of objects in the scene
- Use of multiple textures in order to better simulate an environment

### Room Scene
  - Board and auxiliary board
  - Captures counter
  - Time clock
  - Ability to undo a move by pressing the 'U' key on the keyboard
  - Textured tables
  - Textured paintings

----
## Issues/Problems

- Our algorithm for getting possible captures for king pieces does not calculate multiple consecutive captures without the player moving to an appropriate location first. Single pieces do have this capability, however.
- We were unable to perform more elaborate shading, namely shading the borders of pieces, due to our initial design decisions making it harder to implement
