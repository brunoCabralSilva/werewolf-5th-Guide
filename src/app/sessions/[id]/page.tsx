'use client'
import { useRouter } from "next/navigation";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import Loading from "../../../components/loading";
import Nav from '@/components/nav';
import SessionBar from "../../../components/sessionBar";
import Message from "@/components/message";
import MenuPlayer from "@/components/popup/menuPlayer";
import MenuGameMaster from "@/components/popup/menuGameMaster";
import MenuRoll from "@/components/popup/menuRoll";
import contexto from "@/context/context";
import { authenticate } from "@/firebase/authenticate";
import { getPlayerByEmail, getPlayersBySession } from "@/firebase/players";
import { getSessionById } from "@/firebase/sessions";
import firestoreConfig from "@/firebase/connection";
import MessageToUser from "@/components/popup/messageToUser";
import PlayerSheet from "@/components/popup/playerSheet";
import DeleteHistoric from "@/components/popup/deleteHistoric";
import CreateSheet from "@/components/popup/createSheet";

export default function SessionId({ params } : { params: { id: string } }) {
	const { id } = params;
  const db = getFirestore(firestoreConfig);
  const dataRef = collection(db, "chats");
  const queryData = query(dataRef, where("sessionId", "==", id));
  const [chat] = useCollectionData(queryData, { idField: "id" } as any);
  
  const router = useRouter();
	const [showData, setShowData] = useState(false);
	const [gameMaster, setGameMaster] = useState(false);
  const {
    setDataSheet,
    setName,
    setEmail,
    setSessionId,
    resetPopups,
    setPlayers,
    showPlayer,
    showCreateSheet,
    session, setSession,
    showMessage, setShowMessage,
    showDeleteHistoric,
    email,
    showMenuSession,
  } = useContext(contexto);

  if (gameMaster) {
    const db = getFirestore(firestoreConfig);
    const dataRefPlayer = collection(db, "players");
    const queryDataPlayer = query(dataRefPlayer, where("sessionId", "==", session.id));
    const [data]: any = useCollectionData(queryDataPlayer, { idField: "id" } as any);
    if (data) setPlayers(data[0].list);
  } else {
    const dataRefPlayer = collection(db, "players");
    const queryDataPlayer = query(dataRefPlayer, where("sessionId", "==", id));
    const [data]: any = useCollectionData(queryDataPlayer, { idField: "id" } as any);
    if (data) {
      if (data.length > 0) {
        const player = data[0].list.find((item: any) => item.email === email);
        if (player) setDataSheet(player.data);
      }
    }
  }
	
  const returnValues = async () => {
    const auth = await authenticate(setShowMessage);
    const dataSession: any = await getSessionById(id);
    if (auth) {
      if (dataSession.gameMaster === auth.email) setSession(dataSession);
      else {
        const player: any = await getPlayerByEmail(id, auth.email, setShowMessage);
        if (player) setDataSheet(player.data);
      }
    }
  };

  useEffect(() => {
    resetPopups();
    setSessionId(id);
    setShowData(false);
    verifyUser();
    returnValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyUser = async () => {
    const authData: any = await authenticate(setShowMessage);
    if (authData && authData.email && authData.displayName) {
      setEmail(authData.email);
      setName(authData.displayName);
      const dataDocSnapshot = await getDocs(queryData);
      if (dataDocSnapshot.empty) {
        setShowMessage({ show: true, text: 'A Sessão não foi encontrada' });
        router.push('/sessions');
      } else {
        setShowData(true);
        if (authData.email === 'yslasouzagnr@gmail.com') setShowMessage({ show: true, text: 'Espero que o tempo passe\nEspero que a semana acabe\nPra que eu possa te ver de novo\nEspero que o tempo voe\nPara que você retorne\nPra que eu possa te abraçar\nTe beijar de novo\n<3' });
        const sessionData: any = await getSessionById(id);
        if (sessionData) {
          const players = await getPlayersBySession(id, setShowMessage);
          if (sessionData.gameMaster === authData.email) setGameMaster(true);
          else if (players.find((player: any) => player.email === authData.email)) {
            setGameMaster(false);
          } else {
            setShowMessage({ show: true, text: 'você não é autorizado a estar nesta sessão. Solicite a aprovação do narrador clicando na Sessão em questão.' });
            router.push('/sessions');
          }          
          setShowData(true);
        } else {
          setShowMessage({ show: true, text: 'Houve um erro ao encontrar a sessão. Por favor, atualize e tente novamente' });
          router.push('/sessions');
        }
      }
    } else router.push('/login');
  };
  
  useLayoutEffect(() => {
    const messagesContainer: HTMLElement | null = document.getElementById('messages-container');
    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });

  return (
    <div className="h-screen overflow-y-auto bg-ritual bg-cover bg-top">
      { showMessage.show && <MessageToUser /> }
      { showPlayer.show && <PlayerSheet /> }
      { showDeleteHistoric && <DeleteHistoric /> }
      { showCreateSheet && <CreateSheet /> }
      <Nav />
      {
        showData
        ? <div className="flex bg-black/80">
            <div className="flex flex-col w-full relative">
              <div id="messages-container" className={`relative h-90vh overflow-y-auto pt-2 px-2`}>
                {
                  chat
                  && chat.length > 0
                  && chat[0].list
                  && chat[0].list.length >= 0
                  ? chat[0]
                    && chat[0].list
                      .sort((a: any, b: any) => a.order - b.order)
                      .map((msg: any, index: number) => {
                        if (email !== '' && email === msg.email) {
                          return (<Message key={index} dataMessage={msg} color="green" />);
                        } return (<Message key={index} dataMessage={msg} color="gray" />);
                      })
                  : <div className="bg-black/60 text-white h-90vh flex items-center justify-center flex-col">
                      <Loading />
                    </div>
                }
              </div>
              <SessionBar gameMaster={gameMaster} />
            </div>
            {
              showMenuSession === 'dices' &&
              <div className="w-full md:w-3/5 absolute sm:relative z-50">
                <MenuRoll gameMaster={gameMaster} />
              </div>
            }
            {
              showMenuSession === 'sheet' && 
                <div className="w-full md:w-3/5 absolute sm:relative z-50">
                {
                 gameMaster 
                  ? <MenuGameMaster />
                  : <MenuPlayer />
                }
                </div>
            }
          </div>
        : <div className="h-screen w-full bg-black/80">
            <Loading />
          </div>
      }
    </div>
  );
}