"use client"
import React, { useContext, useState } from 'react'
import FormSection from '../_components/FormSection'
import OutputSection from '../_components/OutputSection'
import { TEMPLATE } from '../../_components/TemplateListSection'
import Templates from '@/app/(data)/Templates'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { chatSession } from '@/utils/AiModel'
import { db } from '@/utils/db'
import { AIOutput } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { create } from 'domain'
import { TotalUsageContext } from '@/app/(context)/TotalUsageContext'
import { useRouter } from 'next/navigation'
import { UpdateCreditUsageContext } from '@/app/(context)/UpdateCreditUsageContext'
import { UserSubscriptionContext } from '@/app/(context)/UserSubscriptionContext'

interface PROPS{
    params:{
        'template-slug':string
    }
    
}

function CreateNewContent(props:PROPS) {

    const selectedTemplate:TEMPLATE|undefined=Templates?.find((item)=>item.slug==props.params['template-slug']);

    const [loading,setLoading]=useState<boolean>(false);

    const [aiOutput,setAiOutput]=useState<string>('');

    const {user}=useUser();
    const router=useRouter();
    const {totalUsage,setTotalUsage}=useContext(TotalUsageContext)
    const {userSubscription,setUserSubscription}=useContext(UserSubscriptionContext)
    const {updateCreditUsage,setUpdateCreditUsage}=useContext(UpdateCreditUsageContext)
    

    const GenrateAIContent = async(formData:any)=>{
      if(totalUsage>=10000)
      {
        console.log("Please Upgrade")
        router.push('/dashboard/billing')
        return ;
      }
      setLoading(true);
      const SelectedPrompt=selectedTemplate?.aiPrompt;

      const FinalAIPrompt=JSON.stringify(formData)+", "+ SelectedPrompt;
      

      const result = await chatSession.sendMessage(FinalAIPrompt);

      console.log(result.response.text());
      setAiOutput(result?.response.text());
      await SaveInDb(formData,selectedTemplate?.slug,result?.response.text())
      setLoading(false);

      setUpdateCreditUsage(Date.now())

    }

    const SaveInDb=async(formData:any,slug:any,aiResp:string)=>{
      const result=await db.insert(AIOutput).values({ 
        formData:formData || '',
        templateSlug:slug || '',
        aiResponse:aiResp || '',
        createdBy:user?.primaryEmailAddress?.emailAddress || 'unknown',
        createdAt:moment().format('DD/MM/YYYY'),
      });

      console.log(result);
    }
    
    
  return (
    <div className='p-10'>
      <Link href={"/dashboard"}>
        <Button> <ArrowLeft/>Back</Button>
      </Link>
    <div className='grid grid-cols-1 md:grid-cols-3 gap-5 py-5'>

        {/*FormSection*/}
        <FormSection
         selectedTemplate={selectedTemplate}
         userFormInput={(v:any)=>GenrateAIContent(v)}
         loading={loading}/>

        {/* {OutputSection} */}
        <div className='col-span-2'>
        <OutputSection aiOutput={aiOutput}/>
        </div>

    </div>
    </div>
  )
}

export default CreateNewContent
