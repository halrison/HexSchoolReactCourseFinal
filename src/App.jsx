import {useCallback, useState, Suspense} from 'react';
import {RouterProvider} from 'react-router/dom';
import router from './routes';
import MessageProvider from './contexts/useToast';
import Loading from './components/Loading';
function App () {
    const pushMessages = useCallback(
        message => {
            setMessages(prev => prev.concat(message))
            setTimeout(
                () => setMessages(prev => prev.slice(1)),
                5000
            )
        },
        []
    )
    const [messages, setMessages] = useState([])
    return (
        <div className="app">
            <MessageProvider value={{messages, pushMessages}}>
                <Suspense fallback={<Loading loading={true} />}>
                    <RouterProvider router={router} />
                </Suspense>
            </MessageProvider>
        </div>
    );
}
export default App;
