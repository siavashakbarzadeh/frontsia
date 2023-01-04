import { Component, HostListener, Inject, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DataService } from './common/services/api/data.service';
import { MetamaskService } from './common/services/metamask/common/metamask.service';
import { ToasterService } from './common/toaster/toaster.service';
import { ChangeDetectionStrategy } from '@angular/compiler/src/compiler_facade_interface';
import { environment } from 'src/environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { CommonContractService } from './common/services/metamask/common-contract/common-contract.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // title = 'ingressdefi';
  isLoginPermit = false;
  isIpValid = false;


  constructor(
    @Inject(DOCUMENT) private document: Document,
    public dataService: DataService,
    private metaMaskService: MetamaskService,
    private toasterService: ToasterService,
    private changeDetectorRef: ChangeDetectorRef,
    private commonContractService: CommonContractService,
    private meta: Meta,
    private title: Title,
    private router: Router
    ) {
    this.getIp();
    this.onActivate();
  }

  @HostListener('window:scroll')
  // tslint:disable-next-line:typedef
  onWindowScroll() {
    if (document.body.scrollTop > 5 || document.documentElement.scrollTop > 5) {
      document.getElementsByTagName('body')[0].classList.add('navbgset');
    } else {
      document.getElementsByTagName('body')[0].classList.remove('navbgset');
    }
  }

  // tslint:disable-next-line:typedef
  onActivate() {
    window.scrollTo(0, 0);
  }

  // tslint:disable-next-line:typedef
  allowToSite() {
    this.checkChainId();
    this.accountChange();
    this.netWorkChange();
    this.mainChanges();
    this.metaCallCommonFunction();
  }

  // tslint:disable-next-line:typedef
  getIp() {
    this.dataService
    .postRequest('admin/chkipaddress', {})
    .subscribe((resData: any) => {
      this.isIpValid = true;

      if (resData.status == true) {
        this.router.navigate(['ipblock']);
        // localStorage.clear();
      } else {
        this.allowToSite();
      }
    });
  }

  // tslint:disable-next-line:typedef
  metaCallCommonFunction() {
    //  After Check

    this.dataService.isMetaReady.subscribe((suc) => {
      if (suc) {
        this.commonContractService.getGovernanceTokenBalance();

        setTimeout(() => {
          this.changeDetectorRef.detectChanges();
        }, 100);
      }
    });

    //  Before Check
    if (this.dataService.metaDeatails.isMetaLogin) {
      this.commonContractService.getGovernanceTokenBalance();

      setTimeout(() => {
        this.changeDetectorRef.detectChanges();
      }, 100);
    }
  }

  // tslint:disable-next-line:typedef use-lifecycle-interface
  ngOnInit() {
    const isLoginPermit: any = localStorage.getItem('isLoginPermit');
    this.connectionMetaMask();
    if (isLoginPermit) {
      this.isLoginPermit = true;
      // this.connectionMetaMask();
    }
    this.siteSettings();
  }

  // tslint:disable-next-line:typedef
  mainChanges() {
    this.dataService.changeDetector.subscribe((suc) => {
      // console.log(suc, "____________________ suc");
      this.changeDetectorRef.detectChanges();
    });
  }

  // tslint:disable-next-line:typedef
  accountChange() {
    const accountChange = this.dataService.accountsChanged.subscribe((suc) => {
      // console.log(suc, "_____________ suc");
      this.connectionMetaMask();
    });
  }

  // tslint:disable-next-line:typedef
  netWorkChange() {
    this.dataService.networkChanged.subscribe((suc) => {
      const responseData: any = suc;

      if (responseData == environment.chainid) {
      } else {
        this.dataService.metaLogout();
        this.toasterService.show(
          false,
          'Change Your Network To Biance mainnet'
          );
        this.changeDetectorRef.detectChanges();
        setTimeout(() => {
          this.changeDetectorRef.detectChanges();
        }, 3000);
      }
    });
  }

  // tslint:disable-next-line:typedef
  checkChainId() {
    this.metaMaskService.checkChainId().then((suc) => {
      const responseData = suc;
      // console.log(responseData, "_________ sucess");

      if (responseData.status) {
      } else {
        this.metaMaskService.addNetwork().then((suc) => {
          // console.log(suc, "_________ sucess");
        });
      }
    });
  }

  // tslint:disable-next-line:typedef
  connectionMetaMask() {
    this.metaMaskService.connectMetaMask().then((suc) => {
      const responseData: any = suc;
      // console.log(this.dataService.metaDeatails.account, " this.dataService.metaDeatails.account");
      if (!responseData.status) {
        this.toasterService.show(false, responseData.message);

        setTimeout(() => {
          this.changeDetectorRef.detectChanges();
        }, 3000);
      } else {
        this.GetEbalance();
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  // tslint:disable-next-line:typedef
  async GetEbalance() {
    this.metaMaskService
    .GetEbalance()
    .then(async (result) => {
      // console.log(result, "result");
      if (result.status) {
        this.dataService.metaDeatails.balance = result.balance;
        console.log(this.dataService.metaDeatails.balance);
      } else {
      }
      this.changeDetectorRef.detectChanges();
    })
    .catch((error) => {});
  }

  // tslint:disable-next-line:typedef
  siteSettings() {
    this.dataService.getRequest('get_site').subscribe((suc: any) => {
      if (suc.status) {
        this.dataService.siteData = suc.data;
        this.setSeo();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  // tslint:disable-next-line:typedef
  setSeo() {
    this.meta.addTags([
      { name: 'description', content: this.dataService.siteData.site_name },
      { name: 'author', content: this.dataService.siteData.site_name },
      { name: 'keywords', content: this.dataService.siteData.site_name },
      ]);
    this.setTitle(this.dataService.siteData.site_name);
    this.addNode();
  }

  // tslint:disable-next-line:typedef
  public setTitle(newTitle: string) {
    this.title.setTitle(newTitle);
  }

  private addNode(): void {
    const linkElement = document.createElement('link');
    linkElement.setAttribute('id', this.dataService.siteData.site_name);
    linkElement.setAttribute('rel', 'icon');
    linkElement.setAttribute('type', 'image/png"');
    linkElement.setAttribute('href', '/assets/images/favicon.png');
    document.head.appendChild(linkElement);
  }
}
