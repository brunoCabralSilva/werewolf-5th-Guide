import contexto from "@/context/context";
import { calculateRageCheck, registerMessage, rollTest } from "@/new/firebase/messagesAndRolls";
import { updateDataPlayer } from "@/new/firebase/players";
import { useContext, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

export function WpConditional(props: { type: string, condition: string }) {
  const { type, condition } = props;
  const [penaltyOrBonus, setPenaltyOrBonus] = useState<number>(0);
  const [marked, setMarked] = useState(false);
  const { sessionId, email, dataSheet, showGiftRoll, setShowGiftRoll, returnSheetValues, setShowMenuSession, } = useContext(contexto);

  const discountWillpower = async() => {
    if (marked) {
      let agravatedValue = false;
      const actualWillpower = dataSheet.composure + dataSheet.resolve - dataSheet.willpower.length;
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
            window.alert(`Você não possui mais pontos de Força de Vontade para realizar este teste (Já sofreu todos os danos Agravados possíveis).`);
          }
        }
      }
      updateDataPlayer(sessionId, email, dataSheet);
    }
    await registerMessage(sessionId, { type: 'gift', ...showGiftRoll.gift }, email);
    returnSheetValues();
  }

  return(
    <div className="w-full">
      <label
        htmlFor="checkboxReflexive"
        className="pb-5 w-full text-white flex items-start cursor-pointer">
        <input
          type="checkbox"
          id="checkboxReflexive"
          className="mr-2 mt-1"
          checked={marked}
          onChange={ (e: any) => setMarked(e.target.checked) }
        />
        <span>{ condition }</span>
      </label>
      <button
        className="text-white bg-black hover:border-red-800 border-2 border-white  transition-colors cursor-pointer w-full p-2 font-bold"
        onClick={ () => {
          discountWillpower();
          setShowMenuSession('');
          setShowGiftRoll({ show: false, gift: {} });
        }}
      >
        Ativar Dom
      </button>
    </div>
  )
}