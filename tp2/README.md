# SGI 2022/2023 - TP1

## Group: T03G04

| Name            | Number    | E-Mail                 |
| --------------- | --------- | ---------------------- |
| Lucas Santos    | 201904517 | 201904517@edu.fe.up.pt |
| Mário Travassos | 201905871 | 201904517@edu.fe.up.pt |

----
## Project information

- The objects modeled after NURBS surfaces were correctly implemented, and our application follows the guidelines set in the project's specification correctly.
- The parser is still quite robust, throwing warnings when the XML file has invalid components, but still rendering the scene in most cases, unless these components cannot be loaded with the invalid components, or it makes no sense for the parser to assume default values.
- The interface is very user friendly, allowing to change views, toggle lights, and show the lights' positions. Additionally, in the second delivery of the project, we implemented controls which allow the user to modify the way in which the shaders and animations are displayed.
- The most difficult thing to implement for us was the shaders. Besides that, we ran into some difficulties when it came to synchronizing events in our application: synchronizing the fragment color changes in the fragment shader with the geometry changes in the vertex shader.
- Scene
  - The demonstration scene consists of some planets from an alternative universe with different laws of physics. A sun and a planet with some child objects were also added. some objects on the scene have animations and a shader applied to them.
  - [General View of the Scene](scenes/screenshots/1.png)
  - [General View of the Scene 2](scenes/screenshots/2.png)
  - [Scene XML](scenes/demo.xml)
----
## Issues/Problems

- There were no identified issues.
