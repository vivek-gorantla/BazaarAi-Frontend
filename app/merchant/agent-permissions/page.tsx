import React from 'react';
import { getAgentPermissionsData } from '@/services/merchantApi';

export default async function AgentPermissions() {
  const data = await getAgentPermissionsData();

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="mb-section-gap">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{data.header.title}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">{data.header.description}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter mb-section-gap">
          {data.roles.map(role => (
            <div key={role.id} className={`${role.bgClass} rounded-[24px] p-card-padding shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow duration-300`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] -mr-8 -mt-8 transition-transform duration-500 ${role.blurClass}`}></div>
              <div className="flex items-center gap-4 mb-6 relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${role.iconBgClass} ${role.iconColorClass}`}>
                  <span className="material-symbols-outlined text-[24px]">{role.icon}</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">{role.name}</h2>
                  <p className="font-label-md text-label-md text-on-surface-variant tracking-normal">{role.description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 relative">
                {role.permissions.map((perm, index) => (
                  <React.Fragment key={perm.id}>
                    {/* Add a divider before the first high-impact/warning permission if needed, or we can just render the items */}
                    <label className="flex items-start gap-3 cursor-pointer group/label">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input defaultChecked={perm.defaultChecked} className="peer sr-only" type="checkbox" />
                        <div className="w-5 h-5 rounded-[4px] bg-surface-container-high peer-defaultChecked:bg-primary transition-colors duration-200 flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-primary text-[16px] opacity-0 peer-defaultChecked:opacity-100 transition-opacity duration-200">check</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-body-md text-body-md text-on-surface block leading-tight group-hover/label:text-primary transition-colors">{perm.name}</span>
                        {perm.warning ? (
                          <span className="font-label-md text-label-md text-error/80 text-[12px] flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[14px]">warning</span>{perm.warning}</span>
                        ) : (
                          <span className="font-label-md text-label-md text-on-surface-variant text-[12px] opacity-70">{perm.description}</span>
                        )}
                      </div>
                    </label>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-gutter flex justify-end">
          <button className="bg-primary text-on-primary font-label-md text-label-md h-[56px] px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2" id="savePermissionsBtn">
            <span className="material-symbols-outlined">save</span>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}