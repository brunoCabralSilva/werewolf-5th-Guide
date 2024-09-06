'use client'
import { collection, documentId, getDocs, getFirestore, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import firestoreConfig from '../../../../firebase/connection';
import { useRouter } from "next/navigation";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import Loading from "../../../../new/components/loading";
import { authenticate } from "@/new/firebase/authenticate";
import Nav from "@/components/nav";
import SessionBar from "../../../../new/components/sessionBar";
import contexto from "@/context/context";
import Message from "@/new/components/message";
import MenuPlayer from "@/new/components/popup/menuPlayer";
import MenuGameMaster from "@/new/components/popup/menuGameMaster";
import MenuRoll from "@/new/components/popup/menuRoll";

export default function SessionId({ params } : { params: { id: string } }) {
	const { id } = params;
  const db = getFirestore(firestoreConfig);
	const sessionRef = collection(db, "sessions2");
	const querySession = query(sessionRef, where(documentId(), "==", id));
	const [session] = useCollectionData(querySession, { idField: "id" } as any);

  const router = useRouter();
	const [showData, setShowData] = useState(false);
  const [email, setEmail] = useState('');
	const [gameMaster, setGameMaster] = useState(false);
  const [dataSession, setDataSession] = useState({});
  const {
    showMenuSession,
    dataUser, setSessionId,
  } = useContext(contexto);
	
  useEffect(() => {
    setSessionId(id);
    setDataSession({ show: false, id: '' });
    setShowData(false);
    verifyUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyUser = async () => {
    let email = '';
    let displayName = '';

    if (dataUser.email && dataUser.displayName) {
      email = dataUser.email;
      displayName = dataUser.displayName;
    } else {
      const authData: any = await authenticate();
      if (authData && authData.email && authData.displayName) {
        email = authData.email;
        displayName = authData.displayName;
      } else router.push('/new/login');
    }

    if (email !== '' && displayName !== '') {
      const sessionDocSnapshot = await getDocs(querySession);
      if (sessionDocSnapshot.empty) {
        window.alert('A Sessão não foi encontrada');
        router.push('/new/sessions');
      } else {
        const sessionData = sessionDocSnapshot.docs[0].data();
        setShowData(true);
        setEmail(email);
        if (email === 'yslasouzagnr@gmail.com') window.alert('Espero que o tempo passe\nEspero que a semana acabe\nPra que eu possa te ver de novo\nEspero que o tempo voe\nPara que você retorne\nPra que eu possa te abraçar\nTe beijar de novo\n<3');
        if (sessionData.name) {
          setDataSession(sessionData);
          if (sessionData.gameMaster === email) setGameMaster(true);
          else if (sessionData.players.find((player: any) => player.email === email)) {
            setGameMaster(false);
          } else {
            window.alert('você não é autorizado a estar nesta sessão. Solicite a aprovação do narrador clicando na Sessão em questão.');
            router.push('/new/sessions');
          }          
          setShowData(true);
        } else {
          window.alert('Houve um erro ao encontrar a sessão. Por favor, atualize e tente novamente');
          router.push('/new/sessions');
        }
      }
    }
  };
  
  useLayoutEffect(() => {
    const messagesContainer: HTMLElement | null = document.getElementById('messages-container');
    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });

  return (
    <div className="h-screen overflow-y-auto bg-ritual bg-cover bg-top">
      <Nav />
      {
        showData
        ? <div className="flex bg-black/80">
            <div className="flex flex-col w-full relative">
              <div id="messages-container" className={`relative h-90vh overflow-y-auto pt-2 px-2`}>
                {
                  session
                  && session.length > 0
                  && session[0].chat
                  && session[0].chat.length >= 0
                  ? session[0]
                    && session[0].chat
                      .sort((a: any, b: any) => {
                        const dateA = new Date(a.date.split(', ')[0].split('/').reverse().join('-') + 'T' + a.date.split(', ')[1]).getTime();
                        const dateB = new Date(b.date.split(', ')[0].split('/').reverse().join('-') + 'T' + b.date.split(', ')[1]).getTime();
                        return dateA - dateB;
                      })
                      .map((msg: any, index: number) => {
                        if (email !== '' && email === msg.email) {
                          return (<Message index={index} dataMessage={msg} color="green" />);
                        } return (<Message index={index} dataMessage={msg} color="gray" />);
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
      {/* { slice.popupResetSheet && <PopupResetSheet /> }
      { slice.deleteHistoric && <PopupDelHistoric /> } */}
    </div>
  );
}