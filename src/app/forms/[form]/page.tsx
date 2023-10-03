'use client';
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useSlice } from "@/redux/slice";
import Image from "next/image";
import Simplify from "@/components/simplify";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import listForms from '../../../data/forms.json';
import { IForm } from "../../../../interface";


export default function Form({ params } : { params: { form: String } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [dataForm, setDataForm] = useState<IForm>();
  const slice = useAppSelector(useSlice);

  useEffect(() => {
    const findForm: IForm | undefined = listForms
      .find((frm: IForm) => {
        if (params.form === 'hominideo') {
          return 'hominídeo' === frm.name.toLowerCase()
        } return params.form === frm.name.toLowerCase()
      }
    );
    setDataForm(findForm);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (dataForm) {
    return(
      <div className="w-full bg-ritual bg-cover bg-top relative">
        <div className={`absolute w-full h-full ${slice.simplify ? 'bg-black' : 'bg-black/90'}`} />
        <Simplify />
        <Nav />
        <section className="mb-2 relative px-2">
        <div className="py-10 flex flex-col items-center sm:items-start w-full z-20 text-white text-justify overflow-y-auto">
          <div className="flex items-center justify-center w-full relative h-full">
            <div className="absolute h-full w-full sm:w-5/12 flex items-center justify-center">
              { isLoading && <span className="loader z-50" /> }
            </div>
            <Image
              src={`/images/forms/${dataForm.name}.png`}
              alt={`Glifo dos ${dataForm.name}`}
              className="w-10/12 sm:w-1/6 sm:w-38 my-2"
              width={800}
              height={400}
              onLoad={() => setIsLoading(false)}
            />
          </div>
          <div className="mt-4 mobile:mt-4 px-6 text-sm sm:text-base w-full">
            <h2 className="font-bold text-xl sm:text-2xl w-full text-center">
              {`${dataForm.name} - ${dataForm.subtitle}`}
            </h2>
            <p className="pt-3">{ dataForm.description }</p>
            <div className="w-full my-2">
              <span className="pr-1 font-bold">Custo:</span>
              <span>{ dataForm.cost }</span>
            </div>
            <p>
              <span className="pr-1 font-bold">Habilidades e Limitações:</span>
              <span>{ dataForm.skills }</span>
            </p>
            {
              dataForm.list.map((paragraph: String, index: number) => (
                <li className="py-1" key={ index }>
                  { paragraph }
                </li>
              ))
            }
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
} return (
    <div className="w-full bg-ritual bg-cover bg-top relative h-screen">
      <div className={`absolute w-full h-full ${slice.simplify ? 'bg-black' : 'bg-black/80'}`} />
      <Simplify />
      <Nav />
      <span className="loader z-50" />
    </div>
  );
}