import {useCallback, useState} from 'react';
import {RouterProvider} from 'react-router/dom';
import router from './routes';
import MessageProvider from './contexts/useToast';
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
                <RouterProvider router={router} />
            </MessageProvider>
        </div>
    );
}
export default App;
