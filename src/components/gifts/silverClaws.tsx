import contexto from "@/context/context";
import { registerMessage } from "@/firebase/messagesAndRolls";
import { updateDataPlayer } from "@/firebase/players";
import { useContext } from "react";

export function SilverClaws() {
  const { sessionId, email, dataSheet, showGiftRoll, setShowGiftRoll, returnSheetValues, setShowMenuSession, setShowMessage } = useContext(contexto);

  const rollRage = async () => {
    if (dataSheet.form !== "Crinos") {
        let agravatedValue = false;
        const actualWillpower = dataSheet.attributes.composure + dataSheet.attributes.resolve - dataSheet.willpower.length;
        if (actualWillpower < 0) agravatedValue =  true;
        if (dataSheet.willpower.length === 0) {
          if (agravatedValue) dataSheet.willpower.push({ value: 1, agravated: true });
          else dataSheet.willpower.push({ value: 1, agravated: false });
        } else {
          const resolveComposure = dataSheet.attributes.resolve + dataSheet.attributes.composure;
          const agravated = dataSheet.willpower.filter((fdv: any) => fdv.agravated === true).map((fd: any) => fd.value);
          const superficial = dataSheet.willpower.filter((fdv: any) => fdv.agravated === false).map((fd: any) => fd.value);
          const allValues = Array.from({ length: resolveComposure }, (_, i) => i + 1);
          const missingInBoth = allValues.filter(value => !agravated.includes(value) && !superficial.includes(value));
          if (missingInBoth.length > 0) {
            const smallestNumber = Math.min(...missingInBoth);
            if (agravatedValue) dataSheet.willpower.push({ value: smallestNumber, agravated: true });
            else dataSheet.willpower.push({ value: smallestNumber, agravated: false });
          } else {
            const missingInAgravated = allValues.filter(value => !agravated.includes(value));
            if (missingInAgravated.length > 0) {
              const smallestNumber = Math.min(...missingInAgravated);
              dataSheet.willpower.push({ value: smallestNumber, agravated: true });
            } else {
              setShowMessage({ show: true, text: 'Você não possui mais pontos de Força de Vontade para realizar este teste (Já sofreu todos os danos Agravados possíveis).' });
            }
          }
        }
        updateDataPlayer(sessionId, email, dataSheet, setShowMessage);
    }
    await registerMessage(sessionId, { type: 'gift', ...showGiftRoll.gift }, email, setShowMessage);
    returnSheetValues();
  }

  return(
    <div className="w-full">
      <button
        className="text-white bg-black hover:border-red-800 border-2 border-white  transition-colors cursor-pointer w-full p-2 font-bold"
        onClick={ () => {
          rollRage();
          setShowMenuSession('');
          setShowGiftRoll({ show: false, gift: {} });
        }}
      >
        Ativar Dom
      </button>
    </div>
  )
}