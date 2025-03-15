import {
    QueryCache,
    QueryClient,
    QueryClientProvider,
  } from '@tanstack/react-query';
  import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
  import { useState } from 'react';
  
  const TanstackQueryProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(
      () =>
        new QueryClient({
          queryCache: new QueryCache({
            onError: (error, query) => {
              alert(`ERROR: ${query.queryKey}: ${error.message}`);
            },
          }),
        }),
    );
    return (
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        {children}
      </QueryClientProvider>
    );
  };
  
  export default TanstackQueryProvider;