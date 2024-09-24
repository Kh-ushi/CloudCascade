import './LastBar.css'

export default function LastBar({ selectedOption }) {

    let decideLastBar = () => {

        switch (selectedOption) {

            case 'DashBoard':
                return (
                    <>
                        <div>
                            <h2 className='h2'>Description</h2>
                            <div className='desc'><p>It is a network-based system that stores and manages data across multiple servers or devices. Instead of storing all files on a single server, the system distributes data across different locations</p></div>
                        </div>
                        <br />
                        <div>
                            <h2>Cloud Services Used</h2>
                            <div className='Info'>
                                <div>
                                    <ul>
                                        <li>Cloudinary</li>
                                        <li>BlackBaze B2</li>
                                        <li>Upstash Reddis</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <br />
                        <div>
                            <h2>Benefits</h2>
                            <div className='Benefits'>
                                <ul>
                                    <li>Load Balancing</li>
                                    <li>Increased Upload Speed</li>
                                    <li>Increased Download Speed</li>
                                </ul>
                            </div>
                        </div>
                    </>
                );

            case 'UploadFiles':
                return (
                    <>
                        <div>
                            <h2>Description</h2>
                            <div className='desc'><p>Select the file you wish to upload, then choose the appropriate folder based on the file type where you'd like to store it</p></div>
                        </div>
                        <div className='Caution'>
                            <h2 style={{ color: "red" }}>Caution!</h2>
                            <p>Please be cautious when uploading files to CloudCascade. Once uploaded, files can be accessed by any user of the platform. Avoid uploading confidential or sensitive information, as the files are shared across the network and accessible to multiple users.</p>

                        </div>
                    </>
                );

              case 'AllFiles':
                return(
                    <>
                     <div>
                            <h2>Description</h2>
                            <div className='desc'><p>Here, you can browse all the files available on this platform. Simply search for the file you need and download it directly from this page.</p></div>
                        </div>
                     
                    </>
                )  
        }
    }

    return (
        <div className='LastBar'>
            {decideLastBar()}
        </div>
    )
}