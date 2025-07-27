
'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Mic, Send, Loader2, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { askChatbot } from '@/ai/flows/ask-chatbot';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import type { Receipt } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps {
  receipts: Receipt[];
}

export function Chatbot({ receipts }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || input;
    if (!content.trim() && !isLoading) return;

    const newUserMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    // Add a placeholder for the assistant's response
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const chatHistory = [...messages, newUserMessage].map(msg => ({ role: msg.role, content: msg.content }));

      const responseStream = await askChatbot({
        history: chatHistory,
        receipts: receipts,
      });
      
      for await (const chunk of responseStream) {
         setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content += chunk;
          }
          return newMessages;
        });
      }

    } catch (error) {
      console.error('Chatbot error:', error);
       setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content = "Sorry, I'm having trouble connecting. Please try again later.";
          }
          return newMessages;
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            setIsLoading(true);
            try {
              const { text } = await transcribeAudio({ audioDataUri: base64Audio });
              await handleSendMessage(text);
            } catch (error) {
              console.error('Transcription error:', error);
              toast({
                title: 'Transcription Failed',
                description: 'Could not understand the audio. Please try again.',
                variant: 'destructive',
              });
            } finally {
                setIsLoading(false);
            }
          };
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Microphone access denied:', error);
        toast({
          title: 'Microphone Access Denied',
          description: 'Please allow microphone access in your browser settings to use this feature.',
          variant: 'destructive',
        });
      }
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
        onClick={() => setIsOpen(true)}
        aria-label="Open Chatbot"
      >
        <Bot className="h-8 w-8" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg flex flex-col h-[80vh]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Bot />
              Financial Assistant
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-4 -mr-4" ref={scrollAreaRef}>
             <div className="space-y-4 pr-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5 m-auto" />
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-xs rounded-lg p-3 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.content}
                    {isLoading && index === messages.length - 1 && (
                       <span className="h-3 w-0.5 bg-foreground inline-block animate-pulse"></span>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 bg-muted text-muted-foreground">
                       <User className="h-5 w-5 m-auto" />
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && !messages.some(m => m.role === 'assistant' && m.content === '') && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5 m-auto" />
                  </Avatar>
                   <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                      <span className="h-2 w-2 bg-primary rounded-full animate-pulse delay-0"></span>
                      <span className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150"></span>
                      <span className="h-2 w-2 bg-primary rounded-full animate-pulse delay-300"></span>
                   </div>
                </div>
              )}
             </div>
          </ScrollArea>
           <DialogFooter className="flex-shrink-0 pt-4">
             <div className="relative w-full">
               <Input
                placeholder={isRecording ? "Recording... speak now" : "Ask a question..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || isRecording}
                className="pr-20"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAudioRecording}
                    disabled={isLoading}
                    className={cn("rounded-full h-8 w-8", isRecording && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !input.trim()}
                    className="rounded-full h-8 w-8 mr-1"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
               
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const Avatar = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('flex h-10 w-10 shrink-0 overflow-hidden rounded-full items-center justify-center', className)}>
    {children}
  </div>
);
