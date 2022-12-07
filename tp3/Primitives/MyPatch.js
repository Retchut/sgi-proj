import { CGFobject, CGFnurbsObject, CGFnurbsSurface } from '../../lib/CGF.js';

/*
    superfícies; a classe deve considerar a possibilidade de as curvas poderem ser de grau 1, 2 ou 3 em qualquer das direções “U” e “V”. Adicionalmente, é definido o número de subdivisões/vértices ao longo da superfície em ambas direções (“partsU” / “partsV”)
*/
// Rectângulo: superfície com grau 1 na direção “U” e grau 1 na direção “V”; deve definir o número de subdivisões em U e V tal que permita observar a qualidade da variação de iluminação criada por uma fonte de luz, propositadamente colocada nas proximidades.
// Tenda: superfície com grau 1 na direção “U” e grau 2 na direção “V”; os topos são abertos.
// Barril: superfície cilíndrica cuja geratriz é uma linha curva; na impossibilidade de ser modelada numa única peça, a superfície lateral do barril poderá corresponder à junção de duas ou mais superfícies; os topos do barril devem ser fechados com círculos, também eles modelados com base numa superfície 2D/3D (solução aproximada); utilizar os graus mínimos necessários para “U” e para “V”.

export class MyPatch extends CGFobject {
    constructor(scene, id, uDeg, vDeg, uDivs, vDivs, controlPoints) {
        super(scene);
        
        var surface = new CGFnurbsSurface(uDeg, vDeg, controlPoints);
        this.nurbsObj = new CGFnurbsObject(scene, uDivs, vDivs, surface);
    }

    display() {
        this.nurbsObj.display();
    }

    /**
     * @method updateTexCoords
     * Updates the texture coordinates of the component
     * @param length_s - Texture scale factor for the s axis
     * @param length_t - Texture scale factor for the t axis
     */
    updateTexCoords(length_s, length_t) {
        return;
    }
}