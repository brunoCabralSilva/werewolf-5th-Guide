'use client'
import firebaseConfig from "@/firebase/connection";
import { useAppDispatch } from "@/redux/hooks";
import { actionRollDice } from "@/redux/slice";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import { useState } from "react";
import { FaChevronLeft, FaMinus, FaPlus } from "react-icons/fa";

export default function PopUpDices() {
  const [valueOfRage, setValueOfRage] = useState<number>(0);
  const [valueOf, setValueOf] = useState<number>(0);
  const [penaltyOrBonus, setPenaltyOrBonus] = useState<number>(0);
  const [dificulty, setDificulty] = useState<number>(0);
  const dispatch = useAppDispatch();

  interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }

  const registerRoll = async () => {
    let resultOfRage = [];
    let resultOf = [];
    let valueWithPenaltyOfBonus = Number(penaltyOrBonus) + Number(valueOf);
    let totalOfRage = valueOfRage;
    if (valueWithPenaltyOfBonus < 0) {
      totalOfRage = Number(valueOfRage) + valueWithPenaltyOfBonus;
      valueWithPenaltyOfBonus = 0;
    }

    for (let i = 0; i < Number(totalOfRage); i += 1) {
      const value = Math.floor(Math.random() * 10) + 1;
      resultOfRage.push(value);
    }

    for (let i = 0; i < Number(valueWithPenaltyOfBonus); i += 1) {
      const value = Math.floor(Math.random() * 10) + 1;
      resultOf.push(value);
    }

    const db = getFirestore(firebaseConfig);
    const messagesRef = collection(db, 'chatbot');
    const token = localStorage.getItem('Segredos Da Fúria');
    if (token) {
      const { firstName, lastName, email }: IUser = jwtDecode(token);
      await addDoc(
        messagesRef,
        {
          message: {
            rollOfMargin: resultOf,
            rollOfRage: resultOfRage,
            dificulty,
            penaltyOrBonus,
           },
          user: firstName + ' ' + lastName,
          email: email,
          date: serverTimestamp(),
        }
      );
    }
    dispatch(actionRollDice(false));
  };

  const disabledButton = () => {
    return (valueOfRage == 0 && valueOf == 0) || dificulty <= 0;
  }

  return(
      <div className="w-8/10 p-10 bg-black flex flex-col items-center justify-center h-screen z-50 top-0 right-0">
          <FaChevronLeft
            className="absolute top-0 left-0 text-3xl text-white ml-2 mt-2 cursor-pointer"
            onClick={() => dispatch(actionRollDice(false))}
          />
        <label htmlFor="valueofRage" className="mb-4 flex flex-col items-center">
          <p className="text-white w-full pb-3">Dados de Fúria ( { valueOfRage } )</p>
          <div className="grid grid-cols-5 gap-2 w-full p-2 bg-gray-400">
            <Image
              alt="Dado de 10 faces"
              src={`/images/dices/${valueOfRage >= 1 ? 'falha(rage).png' : 'falha.png'}`}
              width={500}
              height={500}
              onClick={ () => {
                if (valueOfRage === 1) setValueOfRage(0);
                else setValueOfRage(1);
              }}
              className="sm:w-14 cursor-pointer"
            />
            <Image
              alt="Dado de 10 faces"
              src={`/images/dices/${valueOfRage >= 2 ? 'falha(rage).png' : 'falha.png'}`}
              width={500}
              height={500}
              className="sm:w-14 cursor-pointer"
              onClick={ () => {
                if (valueOfRage === 2) setValueOfRage(1);
                else setValueOfRage(2);
              }}
            />
            <Image
              alt="Dado de 10 faces"
              src={`/images/dices/${valueOfRage >= 3 ? 'falha(rage).png' : 'falha.png'}`}
              width={500}
              height={500}
              className="sm:w-14 cursor-pointer"
              onClick={ () => {
                if (valueOfRage === 3) setValueOfRage(2);
                else setValueOfRage(3);
              }}
            />
            <Image
              alt="Dado de 10 faces"
              src={`/images/dices/${valueOfRage >= 4 ? 'falha(rage).png' : 'falha.png'}`}
              width={500}
              height={500}
              className="sm:w-14 cursor-pointer"
              onClick={ () => {
                if (valueOfRage === 4) setValueOfRage(3);
                else setValueOfRage(4);
              }}
            />
            <Image
              alt="Dado de 10 faces"
              src={`/images/dices/${valueOfRage === 5 ? 'falha(rage).png' : 'falha.png'}`}
              width={500}
              height={500}
              className="sm:w-14 cursor-pointer"
              onClick={ () => {
                if (valueOfRage === 5) setValueOfRage(4);
                else setValueOfRage(5);
              }}
            />
          </div>
        </label>
        <label htmlFor="valueOf" className="mb-4 flex flex-col items-center w-full">
          <p className="text-white w-full pb-3">Dados Restantes</p>
          <div className="flex w-full">
            <button
              type="button"
              className={`border border-white p-3 cursor-pointer ${ valueOf === 0 ? 'bg-gray-400 text-black' : 'bg-black text-white'}`}
              onClick={ () => {
                if (valueOf > 0) setValueOf(valueOf - 1);
              }}
            >
              <FaMinus />
            </button>
            <div
              className="p-2 text-center text-black w-full bg-white"
            >
              <span className="w-full">{ valueOf }</span>
            </div>
            <button
              type="button"
              className={`border border-white p-3 cursor-pointer ${ valueOf === 50 ? 'bg-gray-400 text-black' : 'bg-black text-white'}`}
              onClick={ () => {
                if (valueOf < 50) setValueOf(valueOf + 1)
              }}
            >
              <FaPlus />
            </button>
          </div>
        </label>
        <label htmlFor="penaltyOrBonus" className="mb-4 flex flex-col items-center w-full">
          <p className="text-white w-full pb-3">Bônus (+) ou Penalidade (-)</p>
          <div className="flex w-full">
            <button
              type="button"
              className={`border border-white p-3 cursor-pointer ${ penaltyOrBonus === -50 ? 'bg-gray-400 text-black' : 'bg-black text-white'}`}
              onClick={ () => {
                if (penaltyOrBonus > -50) setPenaltyOrBonus(penaltyOrBonus - 1)
              }}
            >
              <FaMinus />
            </button>
            <div
              className="p-2 text-center text-black w-full bg-white"
            >
              <span className="w-full">{ penaltyOrBonus }</span>
            </div>
            <button
              type="button"
              className={`border border-white p-3 cursor-pointer ${ penaltyOrBonus === 50 ? 'bg-gray-400 text-black' : 'bg-black text-white'}`}
              onClick={ () => {
                if (penaltyOrBonus < 50) setPenaltyOrBonus(penaltyOrBonus + 1)
              }}
            >
              <FaPlus />
            </button>
          </div>
        </label>
        <label htmlFor="dificulty" className="mb-4 flex flex-col items-center w-full">
          <p className="text-white w-full pb-3">Dificuldade</p>
          <div className="flex w-full">
            <button
              type="button"
              className={`border border-white p-3 cursor-pointer ${ dificulty === 0 ? 'bg-gray-400 text-black' : 'bg-black text-white'}`}
              onClick={ () => {
                if (dificulty > 0) setDificulty(dificulty - 1);
              }}
            >
              <FaMinus />
            </button>
            <div
              className="p-2 text-center text-black w-full bg-white"
            >
              <span className="w-full">{ dificulty }</span>
            </div>
            <button
              type="button"
              className={`border border-white p-3 cursor-pointer ${ dificulty === 15 ? 'bg-gray-400 text-black' : 'bg-black text-white'}`}
              onClick={ () => {
                if (dificulty < 15) setDificulty(dificulty + 1)
              }}
            >
              <FaPlus />
            </button>
          </div>
        </label>
        <button
          className={`${disabledButton() ? 'text-black bg-gray-400 hover:bg-gray-600 hover:text-white transition-colors': 'text-white bg-black hover:border-red-800 transition-colors cursor-pointer' } border-2 border-white w-full p-2 mt-6 font-bold`}
          disabled={disabledButton()}
          onClick={registerRoll}
        >
          Rolar dados
        </button>
      </div>
  )
}